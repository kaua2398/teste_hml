package com.valeshop.timesheet.infra;

import com.valeshop.timesheet.exceptions.DemandNotFoundExeption;
import com.valeshop.timesheet.exceptions.InvalidPasswordException;
import com.valeshop.timesheet.exceptions.UserAlreadyExistsException;
import com.valeshop.timesheet.exceptions.UserNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class RestExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleAllExceptions(Exception ex, WebRequest request) {
        System.err.println("Exceção capturada pelo manipulador genérico: " + ex.getClass().getName());
        ex.printStackTrace(); // Imprime a stack trace completa para análise.

        RestResponseMessage responseMessage = new RestResponseMessage(HttpStatus.INTERNAL_SERVER_ERROR, "Ocorreu um erro inesperado. Verifique os logs do servidor.", 500);
        return new ResponseEntity<>(responseMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    private ResponseEntity<RestResponseMessage> userAlreadyExistsHandler(UserAlreadyExistsException exception) {
        RestResponseMessage threatResponse = new RestResponseMessage(HttpStatus.CONFLICT, exception.getMessage(), 409);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(threatResponse);
    }

    @ExceptionHandler(InvalidPasswordException.class)
    private ResponseEntity<RestResponseMessage> handleInvalidPassword(InvalidPasswordException exception) {
        String message = "Email ou senha incorreto";
        RestResponseMessage responseMessage = new RestResponseMessage(HttpStatus.CONFLICT, message, 409);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(responseMessage);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    private ResponseEntity<RestResponseMessage> handleDataIntegrityViolation(DataIntegrityViolationException exception) {
        String message = "O email fornecido já está em uso.";
        RestResponseMessage responseMessage = new RestResponseMessage(HttpStatus.CONFLICT, message, 409);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(responseMessage);
    }
    @ExceptionHandler(IllegalStateException.class)
    private ResponseEntity<RestResponseMessage> handleIllegalStateException(IllegalStateException exception) {
        String message = "Esta conta já foi verificada.";
        RestResponseMessage responseMessage = new RestResponseMessage(HttpStatus.CONFLICT, message, 409);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(responseMessage);
    }

    @ExceptionHandler(IndexOutOfBoundsException.class)
    private ResponseEntity<RestResponseMessage> handleIndexOutOfBoundsException(IndexOutOfBoundsException exception){
        String message = "O index especificado não existe.";
        RestResponseMessage responseMessage = new RestResponseMessage(HttpStatus.NOT_FOUND, message, 404);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseMessage);
    }
    @ExceptionHandler(DemandNotFoundExeption.class)
    private ResponseEntity<RestResponseMessage> handleDemandNotFoundExeption(DemandNotFoundExeption exception){
        String message = "A demanda especificada não existe.";
        RestResponseMessage responseMessage = new RestResponseMessage(HttpStatus.NOT_FOUND, message, 404);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseMessage);
    }

    @ExceptionHandler(UserNotFoundException.class)
    private ResponseEntity<RestResponseMessage> userNotFoundHandler(UserNotFoundException exception) {
        RestResponseMessage responseMessage = new RestResponseMessage(HttpStatus.NOT_FOUND, exception.getMessage(), 404);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseMessage);
    }

    @ExceptionHandler(DisabledException.class)
    private ResponseEntity<RestResponseMessage> disabledExceptionHandler(DisabledException exception) {
        RestResponseMessage responseMessage = new RestResponseMessage(HttpStatus.BAD_REQUEST, exception.getMessage(), 400);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseMessage);
    }

    @ExceptionHandler(AccessDeniedException.class)
    private ResponseEntity<RestResponseMessage> handleAccessDenied(AccessDeniedException exception) {
        RestResponseMessage responseMessage = new RestResponseMessage(HttpStatus.FORBIDDEN, exception.getMessage(), 403);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(responseMessage);
    }


    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        String message = "Corpo da requisição ausente ou mal formatado.";
        RestResponseMessage responseMessage = new RestResponseMessage(HttpStatus.BAD_REQUEST, message, 400);
        return new ResponseEntity<>(responseMessage, HttpStatus.BAD_REQUEST);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }
}
