package br.ufmg.tcc.acidentes.model

import jakarta.persistence.*

@Entity
@Table(name = "accidents")
data class Accident(

    @Id
    @Column(name = "id")
    val id: Long = 0,

    
    @Column(name = "boletim", unique = true)
    val boletim: String? = null,

    
    @Column(name = "date_time")
    val dateTime: String? = null,

    @Column(name = "year")
    val year: Int? = null,

    @Column(name = "month")
    val month: Int? = null,

    @Column(name = "hour")
    val hour: Int? = null,

    
    @Column(name = "weekday")
    val weekday: Int? = null,

    
    @Column(name = "accident_type")
    val accidentType: String? = null,

    
    @Column(name = "district")
    val district: String? = null,

    
    @Column(name = "neighborhood")
    val neighborhood: String? = null,

    
    @Column(name = "street_type")
    val streetType: String? = null,

    
    @Column(name = "street_name")
    val streetName: String? = null,

    
    @Column(name = "weather")
    val weather: String? = null,

    
    @Column(name = "pavement")
    val pavement: String? = null,

    
    @Column(name = "is_signposted")
    val isSignposted: Int? = null,

    
    @Column(name = "speed_limit")
    val speedLimit: Int? = null,

    
    @Column(name = "is_fatal")
    val isFatal: Int = 0,

    
    @Column(name = "ups_value")
    val upsValue: Double? = null,

    
    @Column(name = "ups_description")
    val upsDescription: String? = null,

    
    @Column(name = "total_people")
    val totalPeople: Int = 0,

    
    @Column(name = "total_fatalities")
    val totalFatalities: Int = 0,

    
    @Column(name = "total_vehicles")
    val totalVehicles: Int = 0,

    
    @Column(name = "latitude")
    val latitude: Double? = null,

    
    @Column(name = "longitude")
    val longitude: Double? = null
)
