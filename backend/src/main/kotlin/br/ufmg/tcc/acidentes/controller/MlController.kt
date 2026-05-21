package br.ufmg.tcc.acidentes.controller

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.UriComponentsBuilder

@RestController
@RequestMapping("/api/ml")
@CrossOrigin(origins = ["http://localhost:5173"])
class MlController {

    @Value("\${ml.service.url:http://localhost:8000}")
    private lateinit var mlServiceUrl: String

    private val restTemplate = RestTemplate()

    @GetMapping("/forecast")
    fun forecast(
        @RequestParam(required = false) year: Int?,
        @RequestParam(required = false) district: String?,
        @RequestParam(required = false) type: String?,
        @RequestParam(defaultValue = "3") periods: Int,
    ): ResponseEntity<Any> = proxy("/forecast", year, district, type, mapOf("periods" to periods))

    @GetMapping("/severity")
    fun severity(
        @RequestParam(required = false) year: Int?,
        @RequestParam(required = false) district: String?,
        @RequestParam(required = false) type: String?,
    ): ResponseEntity<Any> = proxy("/severity", year, district, type)

    @GetMapping("/heatmap")
    fun heatmap(
        @RequestParam(required = false) year: Int?,
        @RequestParam(required = false) district: String?,
        @RequestParam(required = false) type: String?,
    ): ResponseEntity<Any> = proxy("/heatmap", year, district, type)

    private fun proxy(
        path: String,
        year: Int?,
        district: String?,
        type: String?,
        extra: Map<String, Any> = emptyMap(),
    ): ResponseEntity<Any> {
        val builder = UriComponentsBuilder.fromHttpUrl("$mlServiceUrl$path")
        year?.let     { builder.queryParam("year",     it) }
        district?.let { builder.queryParam("district", it) }
        type?.let     { builder.queryParam("type",     it) }
        extra.forEach { (k, v) -> builder.queryParam(k, v) }

        return try {
            val result = restTemplate.getForObject(builder.toUriString(), Any::class.java)
            ResponseEntity.ok(result)
        } catch (ex: Exception) {
            ResponseEntity.status(503).body(mapOf("error" to "ML service unavailable: ${ex.message}"))
        }
    }
}
