package com.xpertiflow.evaluaciones.infrastructure.gateway;

import com.xpertiflow.evaluaciones.api.dto.gateway.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
public class UnitepcGatewayClient {

    private final RestClient restClient;

    @Value("${app.unitepc.client-id}")
    private String clientId;

    @Value("${app.unitepc.client-secret}")
    private String clientSecret;

    @Value("${app.unitepc.system-client-id:sea-evaluaciones}")
    private String systemClientId;

    private String accessToken;
    private Instant tokenExpiration;

    public UnitepcGatewayClient(@Value("${app.unitepc.gateway-base-url}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    private synchronized String getToken() {
        if (accessToken != null && tokenExpiration != null && Instant.now().isBefore(tokenExpiration.minusSeconds(60))) {
            return accessToken;
        }

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);

        TokenResponseDto response = restClient.post()
                .uri("/auth/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(TokenResponseDto.class);

        if (response == null || response.getAccessToken() == null) {
            throw new RuntimeException("No se pudo obtener token del gateway UNITEPC");
        }

        this.accessToken = response.getAccessToken();
        this.tokenExpiration = Instant.now().plusSeconds(response.getExpiresIn() != null ? response.getExpiresIn() : 300);
        log.debug("Token UNITEPC renovado, expira en {} segundos", response.getExpiresIn());
        return this.accessToken;
    }

    public List<BranchOfficeDto> getBranchOffices() {
        return restClient.get()
                .uri("/api/v1/university/externals/research/branchOffices")
                .headers(h -> {
                    h.setBearerAuth(getToken());
                    h.set("clientId", systemClientId);
                })
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    public List<CareerDto> getCareers(String branchOfficeCode) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/university/externals/research/careers")
                        .queryParam("branchOfficeCode", branchOfficeCode)
                        .build())
                .headers(h -> {
                    h.setBearerAuth(getToken());
                    h.set("clientId", systemClientId);
                })
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    public List<CourseDto> getCourses(String branchOfficeCode, String careerCode) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/university/externals/research/courses")
                        .queryParam("branchOfficeCode", branchOfficeCode)
                        .queryParam("careerCode", careerCode)
                        .build())
                .headers(h -> {
                    h.setBearerAuth(getToken());
                    h.set("clientId", systemClientId);
                })
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    public List<GroupItemDto> getGroups(String term, String branchOfficeId, String careerId, String syllabusCourseId) {
        return restClient.get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder.path("/api/v1/student/externals/research/groups");
                    if (term != null && !term.isBlank()) {
                        builder.queryParam("term", term);
                    }
                    if (branchOfficeId != null && !branchOfficeId.isBlank()) {
                        builder.queryParam("branchOfficeId", branchOfficeId);
                    }
                    if (careerId != null && !careerId.isBlank()) {
                        builder.queryParam("careerId", careerId);
                    }
                    if (syllabusCourseId != null && !syllabusCourseId.isBlank()) {
                        builder.queryParam("syllabusCourseId", syllabusCourseId);
                    }
                    return builder.build();
                })
                .headers(h -> {
                    h.setBearerAuth(getToken());
                    h.set("clientId", systemClientId);
                })
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    public List<StudentItemDto> getStudentsByGroup(String groupId) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/student/externals/research/students/byGroup")
                        .queryParam("groupId", groupId)
                        .build())
                .headers(h -> {
                    h.setBearerAuth(getToken());
                    h.set("clientId", systemClientId);
                })
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    public List<CampusDto> getCampuses(String branchOfficeId) {
        return restClient.get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder.path("/api/v1/student/externals/research/campuses");
                    if (branchOfficeId != null && !branchOfficeId.isBlank()) {
                        builder.queryParam("branchOfficeId", branchOfficeId);
                    }
                    return builder.build();
                })
                .headers(h -> {
                    h.setBearerAuth(getToken());
                    h.set("clientId", systemClientId);
                })
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    public List<TimeFrameDto> getTimeFrames() {
        return restClient.get()
                .uri("/api/v1/university/externals/research/timeFrames")
                .headers(h -> {
                    h.setBearerAuth(getToken());
                    h.set("clientId", systemClientId);
                })
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    public TimeFrameDto getActiveTimeFrame() {
        return restClient.get()
                .uri("/api/v1/university/externals/research/timeFrames/active")
                .headers(h -> {
                    h.setBearerAuth(getToken());
                    h.set("clientId", systemClientId);
                })
                .retrieve()
                .body(TimeFrameDto.class);
    }

    public void clearToken() {
        this.accessToken = null;
        this.tokenExpiration = null;
    }
}
