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

    /**
     * Returns aggregated statistics.
     *
     * When no filter is active, uses optimised COUNT queries directly in the DB.
     * When at least one filter is active, loads the matching records and
     * computes all aggregations in-memory (dataset is small enough for this).
     */
    fun getStatistics(
        year:     Int?    = null,
        district: String? = null,
        type:     String? = null
    ): Map<String, Any> {

        val filtered = year != null || district != null || type != null

        if (!filtered) {
            // ── Fast path: delegate all GROUP BY to the database ──────────────
            val total           = repository.count()
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

        // ── Filtered path: load matching records, aggregate in Kotlin ─────────
        val base = repository.findByFilters(year, district, type)

        val total           = base.size.toLong()
        val totalFatalities = base.sumOf { it.totalFatalities }

        // Helper: groups by a nullable key, sorts by count desc, returns list of maps
        fun <K : Comparable<K>> aggregateBy(
            keyName: String,
            selector: (Accident) -> K?
        ): List<Map<String, Any>> =
            base.filter { selector(it) != null }
                .groupBy { selector(it)!! }
                .map { (k, list) -> mapOf(keyName to k, "total" to list.size) }
                .sortedByDescending { it["total"] as Int }

        val byDistrict = aggregateBy("district") { it.district }

        val topNeighborhoods = base
            .filter { it.neighborhood != null }
            .groupBy { it.neighborhood!! }
            .map { (n, list) -> mapOf("neighborhood" to n, "total" to list.size) }
            .sortedByDescending { it["total"] as Int }
            .take(15)

        val byType = aggregateBy("type") { it.accidentType }

        val byYear = base
            .filter { it.year != null }
            .groupBy { it.year!! }
            .map { (y, list) -> mapOf("year" to y, "total" to list.size) }
            .sortedBy { it["year"] as Int }

        val byHour = base
            .filter { it.hour != null }
            .groupBy { it.hour!! }
            .map { (h, list) -> mapOf("hour" to h, "total" to list.size) }
            .sortedBy { it["hour"] as Int }

        val byWeekday = base
            .filter { it.weekday != null }
            .groupBy { it.weekday!! }
            .map { (w, list) -> mapOf("weekday" to w, "total" to list.size) }
            .sortedBy { it["weekday"] as Int }

        return mapOf(
            "totalAccidents"   to total,
            "totalFatalities"  to totalFatalities,
            "byDistrict"       to byDistrict,
            "topNeighborhoods" to topNeighborhoods,
            "byType"           to byType,
            "byYear"           to byYear,
            "byHour"           to byHour,
            "byWeekday"        to byWeekday
        )
    }
}
