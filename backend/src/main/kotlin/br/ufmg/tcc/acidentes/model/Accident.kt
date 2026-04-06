package br.ufmg.tcc.acidentes.model

import jakarta.persistence.*

@Entity
@Table(name = "accidents")
data class Accident(

    @Id
    @Column(name = "id")
    val id: Long = 0,

    /** Accident report number (boletim) - unique BHTrans identifier */
    @Column(name = "boletim", unique = true)
    val boletim: String? = null,

    /** Date and time of the accident (ISO format string from SQLite) */
    @Column(name = "date_time")
    val dateTime: String? = null,

    @Column(name = "year")
    val year: Int? = null,

    @Column(name = "month")
    val month: Int? = null,

    @Column(name = "hour")
    val hour: Int? = null,

    /** Day of week: 0 = Monday, 6 = Sunday */
    @Column(name = "weekday")
    val weekday: Int? = null,

    /** Type of accident (e.g. ABALROAMENTO, COLISAO, ATROPELAMENTO) */
    @Column(name = "accident_type")
    val accidentType: String? = null,

    /** Administrative district of BH (e.g. CENTRO-SUL, PAMPULHA) */
    @Column(name = "district")
    val district: String? = null,

    /** Neighborhood name */
    @Column(name = "neighborhood")
    val neighborhood: String? = null,

    /** Street type (e.g. RUA, AVENIDA) */
    @Column(name = "street_type")
    val streetType: String? = null,

    /** Street name */
    @Column(name = "street_name")
    val streetName: String? = null,

    /** Weather condition at time of accident */
    @Column(name = "weather")
    val weather: String? = null,

    /** Road pavement condition */
    @Column(name = "pavement")
    val pavement: String? = null,

    /** Whether the location had signage (1 = yes, 0 = no) */
    @Column(name = "is_signposted")
    val isSignposted: Int? = null,

    /** Speed limit at the location (km/h) */
    @Column(name = "speed_limit")
    val speedLimit: Int? = null,

    /** Whether the accident resulted in a fatality (1 = yes, 0 = no) */
    @Column(name = "is_fatal")
    val isFatal: Int = 0,

    /** UPS severity score (Unidade Padrão de Severidade) */
    @Column(name = "ups_value")
    val upsValue: Double? = null,

    /** UPS severity description */
    @Column(name = "ups_description")
    val upsDescription: String? = null,

    /** Total number of people involved */
    @Column(name = "total_people")
    val totalPeople: Int = 0,

    /** Total number of fatalities */
    @Column(name = "total_fatalities")
    val totalFatalities: Int = 0,

    /** Total number of vehicles involved */
    @Column(name = "total_vehicles")
    val totalVehicles: Int = 0,

    /** WGS84 latitude (converted from UTM SIRGAS 2000 Zone 23S) */
    @Column(name = "latitude")
    val latitude: Double? = null,

    /** WGS84 longitude (converted from UTM SIRGAS 2000 Zone 23S) */
    @Column(name = "longitude")
    val longitude: Double? = null
)
