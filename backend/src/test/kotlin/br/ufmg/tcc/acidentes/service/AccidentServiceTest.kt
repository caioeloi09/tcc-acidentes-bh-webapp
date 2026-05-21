package br.ufmg.tcc.acidentes.service

import br.ufmg.tcc.acidentes.model.Accident
import br.ufmg.tcc.acidentes.repository.AccidentRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.jupiter.MockitoExtension

@ExtendWith(MockitoExtension::class)
class AccidentServiceTest {

    @Mock private lateinit var repository: AccidentRepository
    @InjectMocks private lateinit var service: AccidentService

    

    private fun accident(
        id:           Long   = 1L,
        year:         Int?   = 2020,
        month:        Int?   = 6,
        hour:         Int?   = 17,
        weekday:      Int?   = 4,
        district:     String? = "CENTRO-SUL",
        neighborhood: String? = "SAVASSI",
        accidentType: String? = "COLISAO",
        isFatal:      Int    = 0,
        totalFatalities: Int = 0,
    ) = Accident(
        id = id, year = year, month = month, hour = hour, weekday = weekday,
        district = district, neighborhood = neighborhood, accidentType = accidentType,
        isFatal = isFatal, totalFatalities = totalFatalities,
    )

    

    @Test
    fun `findAll delegates to repository`() {
        val accidents = listOf(accident(1L), accident(2L))
        `when`(repository.findAll()).thenReturn(accidents)

        val result = service.findAll()

        assertEquals(2, result.size)
        verify(repository).findAll()
    }

    @Test
    fun `findById returns accident when found`() {
        val acc = accident(42L)
        `when`(repository.findById(42L)).thenReturn(java.util.Optional.of(acc))

        assertNotNull(service.findById(42L))
    }

    @Test
    fun `findById returns null when not found`() {
        `when`(repository.findById(99L)).thenReturn(java.util.Optional.empty())

        assertNull(service.findById(99L))
    }

    

    @Test
    fun `getStatistics without filters uses optimised DB queries`() {
        `when`(repository.count()).thenReturn(100L)
        `when`(repository.findAll()).thenReturn(listOf(accident(totalFatalities = 3)))
        `when`(repository.countByDistrict()).thenReturn(emptyList())
        `when`(repository.countByNeighborhood()).thenReturn(emptyList())
        `when`(repository.countByAccidentType()).thenReturn(emptyList())
        `when`(repository.countByYear()).thenReturn(emptyList())
        `when`(repository.countByHour()).thenReturn(emptyList())
        `when`(repository.countByWeekday()).thenReturn(emptyList())

        val stats = service.getStatistics()

        assertEquals(100L, stats["totalAccidents"])
        assertEquals(3, stats["totalFatalities"])
        
        verify(repository, never()).findByFilters(any(), any(), any())
    }

    @Test
    fun `getStatistics without filters returns all expected keys`() {
        `when`(repository.count()).thenReturn(0L)
        `when`(repository.findAll()).thenReturn(emptyList())
        `when`(repository.countByDistrict()).thenReturn(emptyList())
        `when`(repository.countByNeighborhood()).thenReturn(emptyList())
        `when`(repository.countByAccidentType()).thenReturn(emptyList())
        `when`(repository.countByYear()).thenReturn(emptyList())
        `when`(repository.countByHour()).thenReturn(emptyList())
        `when`(repository.countByWeekday()).thenReturn(emptyList())

        val stats = service.getStatistics()

        assertTrue(stats.containsKey("totalAccidents"))
        assertTrue(stats.containsKey("totalFatalities"))
        assertTrue(stats.containsKey("byDistrict"))
        assertTrue(stats.containsKey("topNeighborhoods"))
        assertTrue(stats.containsKey("byType"))
        assertTrue(stats.containsKey("byYear"))
        assertTrue(stats.containsKey("byHour"))
        assertTrue(stats.containsKey("byWeekday"))
    }

    

    @Test
    fun `getStatistics with year filter uses findByFilters`() {
        `when`(repository.findByFilters(2020, null, null)).thenReturn(emptyList())

        service.getStatistics(year = 2020)

        verify(repository).findByFilters(2020, null, null)
        verify(repository, never()).count()
    }

    @Test
    fun `getStatistics with district filter uses findByFilters`() {
        `when`(repository.findByFilters(null, "PAMPULHA", null)).thenReturn(emptyList())

        service.getStatistics(district = "PAMPULHA")

        verify(repository).findByFilters(null, "PAMPULHA", null)
    }

    @Test
    fun `getStatistics with all filters combined uses findByFilters`() {
        `when`(repository.findByFilters(2021, "NORTE", "COLISAO")).thenReturn(emptyList())

        service.getStatistics(year = 2021, district = "NORTE", type = "COLISAO")

        verify(repository).findByFilters(2021, "NORTE", "COLISAO")
    }

    @Test
    fun `getStatistics filtered aggregates totalAccidents correctly`() {
        val accidents = listOf(
            accident(1L, totalFatalities = 1),
            accident(2L, totalFatalities = 2),
            accident(3L, totalFatalities = 0),
        )
        `when`(repository.findByFilters(2020, null, null)).thenReturn(accidents)

        val stats = service.getStatistics(year = 2020)

        assertEquals(3L, stats["totalAccidents"])
        assertEquals(3,  stats["totalFatalities"])
    }

    @Test
    fun `getStatistics filtered groups byDistrict correctly`() {
        val accidents = listOf(
            accident(1L, district = "CENTRO-SUL"),
            accident(2L, district = "CENTRO-SUL"),
            accident(3L, district = "NORTE"),
        )
        `when`(repository.findByFilters(null, null, "COLISAO")).thenReturn(accidents)

        val stats = service.getStatistics(type = "COLISAO")

        @Suppress("UNCHECKED_CAST")
        val byDistrict = stats["byDistrict"] as List<Map<String, Any>>
        val centroSul = byDistrict.find { it["district"] == "CENTRO-SUL" }
        val norte     = byDistrict.find { it["district"] == "NORTE" }

        assertNotNull(centroSul)
        assertNotNull(norte)
        assertEquals(2, centroSul!!["total"])
        assertEquals(1, norte!!["total"])
    }

    @Test
    fun `getStatistics filtered sorts byYear ascending`() {
        val accidents = listOf(
            accident(1L, year = 2022),
            accident(2L, year = 2018),
            accident(3L, year = 2020),
        )
        `when`(repository.findByFilters(null, "CENTRO-SUL", null)).thenReturn(accidents)

        val stats = service.getStatistics(district = "CENTRO-SUL")

        @Suppress("UNCHECKED_CAST")
        val byYear = stats["byYear"] as List<Map<String, Any>>
        val years  = byYear.map { it["year"] }

        assertEquals(listOf(2018, 2020, 2022), years)
    }

    @Test
    fun `getStatistics filtered limits topNeighborhoods to 15`() {
        
        val accidents = (1..20).map { i ->
            (1..i).map { j -> accident(id = (i * 100 + j).toLong(), neighborhood = "BAIRRO_$i") }
        }.flatten()

        `when`(repository.findByFilters(2019, null, null)).thenReturn(accidents)

        val stats = service.getStatistics(year = 2019)

        @Suppress("UNCHECKED_CAST")
        val top = stats["topNeighborhoods"] as List<Map<String, Any>>
        assertTrue(top.size <= 15)
    }
}
