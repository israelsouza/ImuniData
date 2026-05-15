Todos registros
http://localhost:8080/vacina

Importação dados API externa
http://localhost:8080/vacina/importacao/2026

Importação dados manual
http://localhost:8080/vacina/importacao/manual

{
    arquivo JSON `import_data_manual`
}


Registro por id
http://localhost:8080/vacina/201

Filtro por sexo
http://localhost:8080/vacina/filtro/sexo/M

Filtro por UF
http://localhost:8080/vacina/filtro/estado/RJ

Criar um registro
http://localhost:8080/vacina

{
  "municipio": "RIO DE JANEIROOOOOOO",
  "estado": "SP",
  "estado_nome": "RIO DE JANEIRO",
  "vacina": "Vacina Varíola Bavarian Nordic",
  "vacina_sigla": "VVBN",
  "dose": "2ª Dose",
  "sexo_paciente": "F",
  "idade_paciente": 28,
  "data_registro": "2026-01-22 14:54:53-03"
}

Atualização parcial de um registro
http://localhost:8080/vacina/201

{
    "municipio": "RIO DE JANEIRO",
}

Deletar um registro
http://localhost:8080/vacina/1
