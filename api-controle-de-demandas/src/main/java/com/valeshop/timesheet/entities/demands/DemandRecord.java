package com.valeshop.timesheet.entities.demands;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.valeshop.timesheet.entities.user.User;
import com.valeshop.timesheet.infra.converters.JsonListConverter;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "demands")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Inheritance(strategy = InheritanceType.JOINED)
public class DemandRecord implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    protected String owner;
    protected String title;
    protected String gitLink;
    protected Integer priority;
    protected String status;
    protected Date date;
    @Column(columnDefinition = "TEXT")
    protected String description;


    @Convert(converter = JsonListConverter.class)
    @Column(columnDefinition = "LONGTEXT")
    protected List<DemandLogItem> problems;

    @Convert(converter = JsonListConverter.class)
    @Column(columnDefinition = "LONGTEXT")
    protected List<DemandLogItem> observations;

    @Convert(converter = JsonListConverter.class)
    @Column(columnDefinition = "LONGTEXT")
    protected List<DemandLogItem> comments;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", updatable = false)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date completionDate;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "id_user")
    private User user;

    public DemandRecord(Long id, String owner, String title, String gitLink, Integer priority,
                        String status, Date date, String description, User user) {
        this.id = id;
        this.owner = owner;
        this.title = title;
        this.gitLink = gitLink;
        this.priority = priority;
        this.status = status;
        this.date = date;
        this.description = description;
        this.user = user;
    }
}
