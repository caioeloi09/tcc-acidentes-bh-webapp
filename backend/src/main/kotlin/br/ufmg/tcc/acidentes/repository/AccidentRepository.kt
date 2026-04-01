package br.ufmg.tcc.acidentes.repository

import br.ufmg.tcc.acidentes.model.Accident
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface AccidentRepository : JpaRepository<Accident, Long> {

    fun findByNeighborhood(neighborhood: String): List<Accident>

    fun findByDistrict(district: String): List<Accident>

    fun findByAccidentType(accidentType: String): List<Accident>

    fun findByDateTimeBetween(start: LocalDateTime, end: LocalDateTime): List<Accident>

    @Query("SELECT a.neighborhood, COUNT(a) as total FROM Accident a GROUP BY a.neighborhood ORDER BY total DESC")
    fun countByNeighborhood(): List<Array<Any>>

    @Query("SELECT a.accidentType, COUNT(a) as total FROM Accident a GROUP BY a.accidentType ORDER BY total DESC")
    fun countByAccidentType(): List<Array<Any>>

    @Query("SELECT a FROM Accident a WHERE a.latitude IS NOT NULL AND a.longitude IS NOT NULL")
    fun findWithCoordinates(): List<Accident>
}
