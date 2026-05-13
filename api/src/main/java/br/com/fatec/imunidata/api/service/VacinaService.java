package br.com.fatec.imunidata.api.service;

import br.com.fatec.imunidata.api.model.RegistroVacinacao;
import br.com.fatec.imunidata.api.model.dto.ConsultaVacinaResponseDTO;
import br.com.fatec.imunidata.api.model.dto.EstadoResumoDTO;
import br.com.fatec.imunidata.api.model.dto.VacinaResumoDTO;
import br.com.fatec.imunidata.api.repository.VacinaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
public class VacinaService {

    private static final int LIMITE_GLOBAL_REGISTROS = 5000;
    private static final int TAMANHO_MAXIMO_PAGINA = 200;
    private static final Map<String, List<String>> REGIOES_POR_ESTADO = buildRegioes();

    @Autowired
    private VacinaRepository repository;

    public List<RegistroVacinacao> listarTodas() {
        return repository.findAll();
    }

    public Optional<RegistroVacinacao> buscarPorId(int id) {
        return repository.findById(id);
    }

    public RegistroVacinacao salvar(RegistroVacinacao vacina) {
        return repository.save(vacina);
    }

    public Optional<RegistroVacinacao> atualizar(int id, RegistroVacinacao vacinaAtualizada) {
        return repository.findById(id).map(vacina -> {
            if (vacinaAtualizada.getMunicipio() != null && !vacinaAtualizada.getMunicipio().isBlank()) {
                vacina.setMunicipio(vacinaAtualizada.getMunicipio());
            }
            if (vacinaAtualizada.getEstado() != null && !vacinaAtualizada.getEstado().isBlank()) {
                vacina.setEstado(vacinaAtualizada.getEstado());
            }
            if (vacinaAtualizada.getEstado_nome() != null && !vacinaAtualizada.getEstado_nome().isBlank()) {
                vacina.setEstado_nome(vacinaAtualizada.getEstado_nome());
            }
            if (vacinaAtualizada.getVacina() != null && !vacinaAtualizada.getVacina().isBlank()) {
                vacina.setVacina(vacinaAtualizada.getVacina());
            }
            if (vacinaAtualizada.getVacina_sigla() != null && !vacinaAtualizada.getVacina_sigla().isBlank()) {
                vacina.setVacina_sigla(vacinaAtualizada.getVacina_sigla());
            }
            if (vacinaAtualizada.getDose() != null && !vacinaAtualizada.getDose().isBlank()) {
                vacina.setDose(vacinaAtualizada.getDose());
            }
            if (vacinaAtualizada.getSexo_paciente() != null && !vacinaAtualizada.getSexo_paciente().isBlank()) {
                vacina.setSexo_paciente(vacinaAtualizada.getSexo_paciente());
            }
            if (vacinaAtualizada.getIdade_paciente() != null) {
                vacina.setIdade_paciente(vacinaAtualizada.getIdade_paciente());
            }
            if (vacinaAtualizada.getData_registro() != null && !vacinaAtualizada.getData_registro().isBlank()) {
                vacina.setData_registro(vacinaAtualizada.getData_registro());
            }
            return repository.save(vacina);
        });
    }

    public boolean deletar(int id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    public List<RegistroVacinacao> buscarPorVacina(String vacina) {
        return repository.findByVacina(vacina);
    }

    public List<RegistroVacinacao> buscarPorEstado(String estado) {
        return repository.findByEstado(estado);
    }

    public List<RegistroVacinacao> buscarPorSexo(String sexo) {
        return repository.findBySexoPaciente(sexo);
    }

    public ConsultaVacinaResponseDTO consultarComFiltros(
            String busca,
            String vacina,
            String estado,
            String sexo,
            String dia,
            String regiao,
            int pagina,
            int tamanho,
            String ordenarPor,
            String direcao
    ) {
        int paginaValida = Math.max(pagina, 0);
        int tamanhoBase = Math.min(Math.max(tamanho, 1), TAMANHO_MAXIMO_PAGINA);
        int offset = paginaValida * tamanhoBase;

        if (offset >= LIMITE_GLOBAL_REGISTROS) {
            return new ConsultaVacinaResponseDTO(
                    paginaValida,
                    tamanhoBase,
                    0,
                    0,
                    LIMITE_GLOBAL_REGISTROS,
                    List.of()
            );
        }

        int tamanhoDisponivel = Math.min(tamanhoBase, LIMITE_GLOBAL_REGISTROS - offset);
        Pageable pageable = PageRequest.of(
                paginaValida,
                tamanhoDisponivel,
                Sort.by(resolveDirection(direcao), resolveCampoOrdenacao(ordenarPor))
        );

        List<String> estadosRegiao = resolveEstadosDaRegiao(regiao);
        Page<RegistroVacinacao> page = repository.buscarComFiltros(
                sanitizeValue(busca),
                sanitizeValue(vacina),
                sanitizeValue(estado),
                sanitizeValue(sexo),
                sanitizeValue(dia),
                estadosRegiao,
                estadosRegiao.isEmpty(),
                pageable
        );

        long totalLimitado = Math.min(page.getTotalElements(), LIMITE_GLOBAL_REGISTROS);
        int totalPaginas = totalLimitado == 0 ? 0 : (int) Math.ceil((double) totalLimitado / tamanhoBase);

        return new ConsultaVacinaResponseDTO(
                page.getNumber(),
                page.getSize(),
                totalPaginas,
                totalLimitado,
                LIMITE_GLOBAL_REGISTROS,
                page.getContent()
        );
    }

    public List<EstadoResumoDTO> resumoPorEstado(String vacina) {
        return repository.resumoPorEstado(sanitizeValue(vacina));
    }

    public List<VacinaResumoDTO> resumoPorVacina(String estado) {
        return repository.resumoPorVacina(sanitizeValue(estado));
    }

    private Sort.Direction resolveDirection(String direction) {
        if (direction != null && direction.equalsIgnoreCase("asc")) {
            return Sort.Direction.ASC;
        }
        return Sort.Direction.DESC;
    }

    private String resolveCampoOrdenacao(String ordenarPor) {
        if (ordenarPor == null || ordenarPor.isBlank()) {
            return "data_registro";
        }

        return switch (ordenarPor) {
            case "municipio", "estado", "estado_nome", "vacina", "vacina_sigla", "dose", "sexo_paciente", "idade_paciente", "data_registro", "id" -> ordenarPor;
            default -> "data_registro";
        };
    }

    private String sanitizeValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private List<String> resolveEstadosDaRegiao(String regiao) {
        if (regiao == null || regiao.isBlank()) {
            return Collections.emptyList();
        }

        List<String> estados = REGIOES_POR_ESTADO.get(regiao.trim().toUpperCase(Locale.ROOT));
        if (estados == null) {
            return Collections.emptyList();
        }

        return estados;
    }

    private static Map<String, List<String>> buildRegioes() {
        Map<String, List<String>> mapa = new HashMap<>();
        mapa.put("NORTE", Arrays.asList("AC", "AP", "AM", "PA", "RO", "RR", "TO"));
        mapa.put("NORDESTE", Arrays.asList("AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"));
        mapa.put("CENTRO-OESTE", Arrays.asList("DF", "GO", "MT", "MS"));
        mapa.put("SUDESTE", Arrays.asList("ES", "MG", "RJ", "SP"));
        mapa.put("SUL", Arrays.asList("PR", "RS", "SC"));
        return mapa;
    }
}
