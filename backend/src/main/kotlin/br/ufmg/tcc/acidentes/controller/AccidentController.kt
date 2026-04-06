package br.ufmg.tcc.acidentes.controller

import br.ufmg.tcc.acidentes.model.Accident
import br.ufmg.tcc.acidentes.service.AccidentService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = ["http://localhost:5173"])
class AccidentController(private val service: AccidentService) {

    /**
     * GET /api/accidents
     * Returns accidents with optional filters: district, neighborhood, type, year, month.
     */
    @GetMapping("/accidents")
    fun listAccidents(
        @RequestParam(required = false) district: String?,
        @RequestParam(required = false) neighborhood: String?,
        @RequestParam(required = false) type: String?,
        @RequestParam(required = false) year: Int?,
        @RequestParam(required = false) month: Int?
    ): ResponseEntity<List<Accident>> {
        val result = when {
            district != null     -> service.findByDistrict(district)
            neighborhood != null -> service.findByNeighborhood(neighborhood)
            type != null         -> service.findByType(type)
            year != null && month != null -> service.findByYearAndMonth(year, month)
            year != null         -> service.findByYear(year)
            else                 -> service.findAll()
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
     * Returns aggregated statistics for the dashboard:
     * totals, breakdowns by district, neighborhood, type, year, hour and weekday.
     */
    @GetMapping("/statistics")
    fun statistics(): ResponseEntity<Map<String, Any>> =
        ResponseEntity.ok(service.getStatistics())

    /**
     * GET /api/map
     * Returns only accidents that have valid lat/lon coordinates (for Leaflet map).
     */
    @GetMapping("/map")
    fun mapData(): ResponseEntity<List<Accident>> =
        ResponseEntity.ok(service.findWithCoordinates())
}
