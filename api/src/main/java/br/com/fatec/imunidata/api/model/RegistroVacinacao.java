package br.com.fatec.imunidata.api.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
public class RegistroVacinacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotBlank(message = "O município é obrigatório")
    private String municipio;

    @NotBlank(message = "O estado é obrigatório")
    private String estado;

    @NotBlank(message = "O nome do estado é obrigatório")
    private String estado_nome;

    @NotBlank(message = "O nome da vacina é obrigatório")
    private String vacina;

    @NotBlank(message = "A sigla da vacina é obrigatória")
    private String vacina_sigla;

    @NotBlank(message = "A dose é obrigatória")
    private String dose;

    @NotBlank(message = "O sexo do paciente é obrigatório")
    private String sexo_paciente;

    @NotNull(message = "A idade do paciente é obrigatória")
    private Integer idade_paciente;

    @NotBlank(message = "A data de registro é obrigatória")
    private String data_registro;

    private boolean veioDoFormulario = false;

    public RegistroVacinacao() {}

    public RegistroVacinacao(String municipio, String estado, String estado_nome, String vacina, String vacina_sigla, String dose, String sexo_paciente, Integer idade_paciente, String data_registro) {
        this.municipio = municipio;
        this.estado = estado;
        this.estado_nome = estado_nome;
        this.vacina = vacina;
        this.vacina_sigla = vacina_sigla;
        this.dose = dose;
        this.sexo_paciente = sexo_paciente;
        this.idade_paciente = idade_paciente;
        this.data_registro = data_registro;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getMunicipio() {
        return municipio;
    }

    public void setMunicipio(String municipio) {
        this.municipio = municipio;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getEstado_nome() {
        return estado_nome;
    }

    public void setEstado_nome(String estado_nome) {
        this.estado_nome = estado_nome;
    }

    public String getVacina() {
        return vacina;
    }

    public void setVacina(String vacina) {
        this.vacina = vacina;
    }

    public String getVacina_sigla() {
        return vacina_sigla;
    }

    public void setVacina_sigla(String vacina_sigla) {
        this.vacina_sigla = vacina_sigla;
    }

    public String getDose() {
        return dose;
    }

    public void setDose(String dose) {
        this.dose = dose;
    }

    public String getSexo_paciente() {
        return sexo_paciente;
    }

    public void setSexo_paciente(String sexo_paciente) {
        this.sexo_paciente = sexo_paciente;
    }

    public Integer getIdade_paciente() {
        return idade_paciente;
    }

    public void setIdade_paciente(Integer idade_paciente) {
        this.idade_paciente = idade_paciente;
    }

    public String getData_registro() {
        return data_registro;
    }

    public void setData_registro(String data_registro) {
        this.data_registro = data_registro;
    }

    public boolean isVeioDoFormulario() {
        return veioDoFormulario;
    }

    public void setVeioDoFormulario(boolean veioDoFormulario) {
        this.veioDoFormulario = veioDoFormulario;
    }
}