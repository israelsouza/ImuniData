package br.com.fatec.imunidata.api.model.dto;

import br.com.fatec.imunidata.api.model.RegistroVacinacao;

import java.util.List;

public record ConsultaVacinaResponseDTO(
        int pagina,
        int tamanho,
        int totalPaginas,
        long totalElementos,
        int limiteGlobal,
        List<RegistroVacinacao> registros
) {
}
