package br.ufmg.tcc.acidentes.controller

import br.ufmg.tcc.acidentes.model.Accident
import br.ufmg.tcc.acidentes.service.AccidentService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = ["http://localhost:5173"])
class AccidentController(private val service: AccidentService) {

    /**
     * GET /api/accidents
     * Returns a list of accidents with optional filters: neighborhood, district, type, or date range.
     */
    @GetMapping("/accidents")
    fun listAccidents(
        @RequestParam(required = false) neighborhood: String?,
        @RequestParam(required = false) district: String?,
        @RequestParam(required = false) type: String?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) start: LocalDateTime?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) end: LocalDateTime?
    ): ResponseEntity<List<Accident>> {
        val result = when {
            neighborhood != null -> service.findByNeighborhood(neighborhood)
            district != null -> service.findByDistrict(district)
            type != null -> service.findByType(type)
            start != null && end != null -> service.findByDateRange(start, end)
            else -> service.findAll()
        }
        return ResponseEntity.ok(result)
    }

    /**
     * GET /api/accidents/{id}
     * Returns details of a specific accident by ID.
     */
    @GetMapping("/accidents/{id}")
    fun getAccident(@PathVariable id: Long): ResponseEntity<Accident> =
        service.findById(id)
            ?.let { ResponseEntity.ok(it) }
            ?: ResponseEntity.notFound().build()

    /**
     * GET /api/statistics
     * Returns general statistics: total accidents, fatal victims, top neighborhoods, by type.
     */
    @GetMapping("/statistics")
    fun statistics(): ResponseEntity<Map<String, Any>> =
        ResponseEntity.ok(service.getStatistics())

    /**
     * GET /api/map
     * Returns only accidents with geographic coordinates for map visualization.
     */
    @GetMapping("/map")
    fun mapData(): ResponseEntity<List<Accident>> =
        ResponseEntity.ok(service.findWithCoordinates())
}
