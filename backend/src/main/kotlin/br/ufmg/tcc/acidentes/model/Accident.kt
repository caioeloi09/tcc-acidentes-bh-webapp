package br.ufmg.tcc.acidentes.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "accidents")
data class Accident(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "date_time")
    val dateTime: LocalDateTime? = null,

    @Column(name = "street")
    val street: String? = null,

    @Column(name = "number")
    val number: String? = null,

    @Column(name = "neighborhood")
    val neighborhood: String? = null,

    @Column(name = "district")
    val district: String? = null,

    @Column(name = "latitude")
    val latitude: Double? = null,

    @Column(name = "longitude")
    val longitude: Double? = null,

    @Column(name = "accident_type")
    val accidentType: String? = null,

    @Column(name = "total_victims")
    val totalVictims: Int = 0,

    @Column(name = "total_fatal_victims")
    val totalFatalVictims: Int = 0,

    @Column(name = "total_vehicles")
    val totalVehicles: Int = 0
)
