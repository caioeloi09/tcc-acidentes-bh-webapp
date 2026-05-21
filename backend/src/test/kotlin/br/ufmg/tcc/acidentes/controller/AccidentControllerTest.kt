package br.ufmg.tcc.acidentes.controller

import br.ufmg.tcc.acidentes.model.Accident
import br.ufmg.tcc.acidentes.service.AccidentService
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.mockito.Mockito.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(AccidentController::class)
class AccidentControllerTest {

    @Autowired private lateinit var mvc: MockMvc
    @Autowired private lateinit var mapper: ObjectMapper
    @MockBean  private lateinit var service: AccidentService

    private fun accident(id: Long = 1L) = Accident(
        id = id, district = "CENTRO-SUL", accidentType = "COLISAO",
        year = 2020, isFatal = 0, totalFatalities = 0,
    )

    

    @Test
    fun `GET accidents returns 200 with list`() {
        `when`(service.findAll()).thenReturn(listOf(accident(1L), accident(2L)))

        mvc.perform(get("/api/accidents").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(2))
    }

    @Test
    fun `GET accidents with district param delegates to findByDistrict`() {
        `when`(service.findByDistrict("PAMPULHA")).thenReturn(listOf(accident()))

        mvc.perform(get("/api/accidents").param("district", "PAMPULHA"))
            .andExpect(status().isOk)

        verify(service).findByDistrict("PAMPULHA")
    }

    @Test
    fun `GET accidents with year param delegates to findByYear`() {
        `when`(service.findByYear(2021)).thenReturn(emptyList())

        mvc.perform(get("/api/accidents").param("year", "2021"))
            .andExpect(status().isOk)

        verify(service).findByYear(2021)
    }

    @Test
    fun `GET accidents with year and month delegates to findByYearAndMonth`() {
        `when`(service.findByYearAndMonth(2020, 3)).thenReturn(emptyList())

        mvc.perform(
            get("/api/accidents")
                .param("year", "2020")
                .param("month", "3")
        ).andExpect(status().isOk)

        verify(service).findByYearAndMonth(2020, 3)
    }

    

    @Test
    fun `GET accidents by id returns 200 when found`() {
        `when`(service.findById(42L)).thenReturn(accident(42L))

        mvc.perform(get("/api/accidents/42"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(42))
    }

    @Test
    fun `GET accidents by id returns 404 when not found`() {
        `when`(service.findById(999L)).thenReturn(null)

        mvc.perform(get("/api/accidents/999"))
            .andExpect(status().isNotFound)
    }

    

    @Test
    fun `GET statistics returns 200`() {
        val stats = mapOf("totalAccidents" to 100L, "totalFatalities" to 5)
        `when`(service.getStatistics(null, null, null)).thenReturn(stats)

        mvc.perform(get("/api/statistics"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.totalAccidents").value(100))
    }

    @Test
    fun `GET statistics passes year param to service`() {
        `when`(service.getStatistics(2022, null, null)).thenReturn(emptyMap())

        mvc.perform(get("/api/statistics").param("year", "2022"))
            .andExpect(status().isOk)

        verify(service).getStatistics(2022, null, null)
    }

    @Test
    fun `GET statistics passes district and type params to service`() {
        `when`(service.getStatistics(null, "NORTE", "ATROPELAMENTO")).thenReturn(emptyMap())

        mvc.perform(
            get("/api/statistics")
                .param("district", "NORTE")
                .param("type", "ATROPELAMENTO")
        ).andExpect(status().isOk)

        verify(service).getStatistics(null, "NORTE", "ATROPELAMENTO")
    }

    

    @Test
    fun `GET map returns only accidents with coordinates`() {
        val withCoords = accident().copy(latitude = -19.9167, longitude = -43.9345)
        `when`(service.findWithCoordinates()).thenReturn(listOf(withCoords))

        mvc.perform(get("/api/map"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].latitude").value(-19.9167))
    }
}
