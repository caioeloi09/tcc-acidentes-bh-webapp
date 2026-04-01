package br.ufmg.tcc.acidentes.service

import br.ufmg.tcc.acidentes.model.Accident
import br.ufmg.tcc.acidentes.repository.AccidentRepository
import org.springframework.stereotype.Service

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

    fun findByYear(year: Int): List<Accident> =
        repository.findByYear(year)

    fun findByYearAndMonth(year: Int, month: Int): List<Accident> =
        repository.findByYearAndMonth(year, month)

    fun findWithCoordinates(): List<Accident> =
        repository.findWithCoordinates()

    fun getStatistics(): Map<String, Any> {
        val total = repository.count()
        val totalFatalities = repository.findAll().sumOf { it.totalFatalities }

        val byDistrict = repository.countByDistrict()
            .map { row -> mapOf("district" to row[0], "total" to row[1]) }

        val byNeighborhood = repository.countByNeighborhood()
            .take(15)
            .map { row -> mapOf("neighborhood" to row[0], "total" to row[1]) }

        val byType = repository.countByAccidentType()
            .map { row -> mapOf("type" to row[0], "total" to row[1]) }

        val byYear = repository.countByYear()
            .map { row -> mapOf("year" to row[0], "total" to row[1]) }

        val byHour = repository.countByHour()
            .map { row -> mapOf("hour" to row[0], "total" to row[1]) }

        val byWeekday = repository.countByWeekday()
            .map { row -> mapOf("weekday" to row[0], "total" to row[1]) }

        return mapOf(
            "totalAccidents"   to total,
            "totalFatalities"  to totalFatalities,
            "byDistrict"       to byDistrict,
            "topNeighborhoods" to byNeighborhood,
            "byType"           to byType,
            "byYear"           to byYear,
            "byHour"           to byHour,
            "byWeekday"        to byWeekday
        )
    }
}
