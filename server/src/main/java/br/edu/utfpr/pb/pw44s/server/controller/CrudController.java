package br.edu.utfpr.pb.pw44s.server.controller;

import br.edu.utfpr.pb.pw44s.server.service.ICrudService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;
import java.util.List;
import java.util.stream.Collectors;

public abstract class CrudController<T, D, ID extends Serializable> {

    protected abstract ICrudService<T, ID> getService();
    protected abstract ModelMapper getModelMapper();

    private final Class<T> typeClass;
    private final Class<D> typeDtoClass;

    public CrudController(Class<T> typeClass, Class<D> typeDtoClass) {
        this.typeClass = typeClass;
        this.typeDtoClass = typeDtoClass;
    }

    private D convertToDto(T entity) {
        return getModelMapper().map(entity, this.typeDtoClass);
    }

    private T convertToEntity(D entityDto) {
        return getModelMapper().map(entityDto, this.typeClass);
    }

    @GetMapping
    @Operation(summary = "Listar todos os registros", description = "Retorna uma lista contendo todos os registros cadastrados.")
    public ResponseEntity<List<D>> findAll() {
        return ResponseEntity.ok(getService().findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList()));
    }

    @GetMapping("page")
    @Operation(summary = "Listar registros paginados e ordenados", description = "Retorna uma página de registros com suporte a paginação e ordenação opcional.")
    public ResponseEntity<Page<D>> findAll(
            @Parameter(description = "Número da página (inicia em 0)", example = "0") @RequestParam int page,
            @Parameter(description = "Quantidade de registros por página", example = "10") @RequestParam int size,
            @Parameter(description = "Campo para ordenação", example = "id") @RequestParam(required = false) String order,
            @Parameter(description = "Direção da ordenação (true para ASC, false para DESC)", example = "true") @RequestParam(required = false) Boolean asc) {
        PageRequest pageRequest = PageRequest.of(page, size);
        if (order != null && asc != null) {
            pageRequest = PageRequest.of(page, size, asc ? Sort.Direction.ASC : Sort.Direction.DESC, order);
        }
        return ResponseEntity.ok(getService().findAll(pageRequest).map(this::convertToDto));
    }

    @GetMapping("{id}")
    @Operation(summary = "Buscar um registro pelo ID", description = "Retorna os detalhes de um único registro com base no ID fornecido.")
    public ResponseEntity<D> findOne(@Parameter(description = "ID do registro", example = "1") @PathVariable ID id) {
        T entity = getService().findById(id);
        if (entity != null) {
            return ResponseEntity.ok(convertToDto(entity));
        } else {
            return ResponseEntity.noContent().build();
        }
    }

    @PostMapping
    @Operation(summary = "Criar um novo registro", description = "Cria e salva um novo registro com as informações fornecidas no corpo da requisição.")
    public ResponseEntity<D> create(@RequestBody @Valid D entity) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(convertToDto(getService().save(convertToEntity(entity))));
    }

    @PutMapping("{id}")
    @Operation(summary = "Atualizar um registro existente", description = "Atualiza um registro existente identificando-o pelo ID e passando as novas informações no corpo da requisição.")
    public ResponseEntity<D> update(
            @Parameter(description = "ID do registro a ser atualizado", example = "1") @PathVariable ID id,
            @RequestBody @Valid D entity) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(convertToDto(getService().save(convertToEntity(entity))));
    }

    @GetMapping("exists/{id}")
    @Operation(summary = "Verificar se um registro existe pelo ID", description = "Retorna verdadeiro se o registro com o ID fornecido existir no banco de dados, caso contrário, falso.")
    public ResponseEntity<Boolean> exists(@Parameter(description = "ID a ser verificado", example = "1") @PathVariable ID id) {
        return ResponseEntity.ok(getService().exists(id));
    }

    @GetMapping("count")
    @Operation(summary = "Obter a quantidade total de registros", description = "Retorna o número total de registros cadastrados para esta entidade.")
    public ResponseEntity<Long> count() {
        return ResponseEntity.ok(getService().count());
    }

    @DeleteMapping("{id}")
    @Operation(summary = "Excluir um registro pelo ID", description = "Remove permanentemente um registro do banco de dados com base no ID fornecido.")
    public ResponseEntity<Void> delete(@Parameter(description = "ID do registro a ser excluído", example = "1") @PathVariable ID id) {
        getService().deleteById(id);
        return ResponseEntity.noContent().build();
    }
}