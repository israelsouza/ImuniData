package br.com.fatec.imunidata.api.repository;

import br.com.fatec.imunidata.api.model.RegistroVacinacao;
import br.com.fatec.imunidata.api.model.dto.EstadoResumoDTO;
import br.com.fatec.imunidata.api.model.dto.VacinaResumoDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VacinaRepository extends JpaRepository<RegistroVacinacao, Integer> {

	List<RegistroVacinacao> findByVacina(String vacina);

	List<RegistroVacinacao> findByEstado(String estado);

	@Query("select r from RegistroVacinacao r where r.sexo_paciente = :sexo")
	List<RegistroVacinacao> findBySexoPaciente(@Param("sexo") String sexo);

	@Query(value = """
			select r from RegistroVacinacao r
			where (:vacina is null or upper(r.vacina) = upper(:vacina) or upper(r.vacina_sigla) = upper(:vacina))
			  and (:estado is null or upper(r.estado) = upper(:estado))
			  and (:sexo is null or upper(r.sexo_paciente) = upper(:sexo))
			  and (:dia is null or r.data_registro like concat(:dia, '%'))
			  and (:estadosRegiaoVazio = true or upper(r.estado) in :estadosRegiao)
			  and (
				:busca is null
				or upper(r.municipio) like upper(concat('%', :busca, '%'))
				or upper(r.estado_nome) like upper(concat('%', :busca, '%'))
				or upper(r.vacina) like upper(concat('%', :busca, '%'))
				or upper(r.vacina_sigla) like upper(concat('%', :busca, '%'))
			  )
			""",
			countQuery = """
			select count(r) from RegistroVacinacao r
			where (:vacina is null or upper(r.vacina) = upper(:vacina) or upper(r.vacina_sigla) = upper(:vacina))
			  and (:estado is null or upper(r.estado) = upper(:estado))
			  and (:sexo is null or upper(r.sexo_paciente) = upper(:sexo))
			  and (:dia is null or r.data_registro like concat(:dia, '%'))
			  and (:estadosRegiaoVazio = true or upper(r.estado) in :estadosRegiao)
			  and (
				:busca is null
				or upper(r.municipio) like upper(concat('%', :busca, '%'))
				or upper(r.estado_nome) like upper(concat('%', :busca, '%'))
				or upper(r.vacina) like upper(concat('%', :busca, '%'))
				or upper(r.vacina_sigla) like upper(concat('%', :busca, '%'))
			  )
			""")
	Page<RegistroVacinacao> buscarComFiltros(
			@Param("busca") String busca,
			@Param("vacina") String vacina,
			@Param("estado") String estado,
			@Param("sexo") String sexo,
			@Param("dia") String dia,
			@Param("estadosRegiao") List<String> estadosRegiao,
			@Param("estadosRegiaoVazio") boolean estadosRegiaoVazio,
			Pageable pageable
	);

	@Query("""
			select new br.com.fatec.imunidata.api.model.dto.EstadoResumoDTO(r.estado, r.estado_nome, count(r))
			from RegistroVacinacao r
			where (:vacina is null or upper(r.vacina) = upper(:vacina) or upper(r.vacina_sigla) = upper(:vacina))
			group by r.estado, r.estado_nome
			order by count(r) desc
			""")
	List<EstadoResumoDTO> resumoPorEstado(@Param("vacina") String vacina);

	@Query("""
			select new br.com.fatec.imunidata.api.model.dto.VacinaResumoDTO(r.vacina, r.vacina_sigla, count(r))
			from RegistroVacinacao r
			where (:estado is null or upper(r.estado) = upper(:estado))
			group by r.vacina, r.vacina_sigla
			order by count(r) desc
			""")
	List<VacinaResumoDTO> resumoPorVacina(@Param("estado") String estado);
}
