package br.ufmg.tcc.acidentes

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class AccidentsApplication

fun main(args: Array<String>) {
    runApplication<AccidentsApplication>(*args)
}
