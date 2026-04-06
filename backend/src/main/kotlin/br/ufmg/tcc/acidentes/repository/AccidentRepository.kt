package br.ufmg.tcc.acidentes.repository

import br.ufmg.tcc.acidentes.model.Accident
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface AccidentRepository : JpaRepository<Accident, Long> {

    fun findByNeighborhood(neighborhood: String): List<Accident>

    fun findByDistrict(district: String): List<Accident>

    fun findByAccidentType(accidentType: String): List<Accident>

    fun findByYear(year: Int): List<Accident>

    fun findByYearAndMonth(year: Int, month: Int): List<Accident>

    @Query("SELECT a FROM Accident a WHERE a.latitude IS NOT NULL AND a.longitude IS NOT NULL")
    fun findWithCoordinates(): List<Accident>

    @Query("SELECT a.district, COUNT(a) as total FROM Accident a WHERE a.district IS NOT NULL GROUP BY a.district ORDER BY total DESC")
    fun countByDistrict(): List<Array<Any>>

    @Query("SELECT a.neighborhood, COUNT(a) as total FROM Accident a WHERE a.neighborhood IS NOT NULL GROUP BY a.neighborhood ORDER BY total DESC")
    fun countByNeighborhood(): List<Array<Any>>

    @Query("SELECT a.accidentType, COUNT(a) as total FROM Accident a WHERE a.accidentType IS NOT NULL GROUP BY a.accidentType ORDER BY total DESC")
    fun countByAccidentType(): List<Array<Any>>

    @Query("SELECT a.year, COUNT(a) as total FROM Accident a WHERE a.year IS NOT NULL GROUP BY a.year ORDER BY a.year ASC")
    fun countByYear(): List<Array<Any>>

    @Query("SELECT a.hour, COUNT(a) as total FROM Accident a WHERE a.hour IS NOT NULL GROUP BY a.hour ORDER BY a.hour ASC")
    fun countByHour(): List<Array<Any>>

    @Query("SELECT a.weekday, COUNT(a) as total FROM Accident a WHERE a.weekday IS NOT NULL GROUP BY a.weekday ORDER BY a.weekday ASC")
    fun countByWeekday(): List<Array<Any>>
}
