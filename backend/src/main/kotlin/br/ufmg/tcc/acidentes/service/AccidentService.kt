package br.ufmg.tcc.acidentes.service

import br.ufmg.tcc.acidentes.model.Accident
import br.ufmg.tcc.acidentes.repository.AccidentRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class AccidentService(private val repository: AccidentRepository) {

    fun findAll(): List<Accident> = repository.findAll()

    fun findById(id: Long): Accident? = repository.findById(id).orElse(null)

    fun count(): Long = repository.count()

    fun findByNeighborhood(neighborhood: String): List<Accident> =
        repository.findByNeighborhood(neighborhood)

    fun findByDistrict(district: String): List<Accident> =
        repository.findByDistrict(district)

    fun findByType(type: String): List<Accident> =
        repository.findByAccidentType(type)

    fun findByDateRange(start: LocalDateTime, end: LocalDateTime): List<Accident> =
        repository.findByDateTimeBetween(start, end)

    fun findWithCoordinates(): List<Accident> =
        repository.findWithCoordinates()

    fun getStatistics(): Map<String, Any> {
        val total = repository.count()
        val totalFatalVictims = repository.findAll().sumOf { it.totalFatalVictims }
        val byNeighborhood = repository.countByNeighborhood()
            .take(10)
            .map { row -> mapOf("neighborhood" to row[0], "total" to row[1]) }
        val byType = repository.countByAccidentType()
            .map { row -> mapOf("type" to row[0], "total" to row[1]) }

        return mapOf(
            "totalAccidents" to total,
            "totalFatalVictims" to totalFatalVictims,
            "topNeighborhoods" to byNeighborhood,
            "byType" to byType
        )
    }
}
