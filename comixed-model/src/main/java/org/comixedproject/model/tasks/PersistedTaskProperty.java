package org.comixedproject.model.tasks;

import java.util.Objects;
import javax.persistence.*;
import lombok.*;

/**
 * <code>PersistedTaskProperty</code> is a single property associated with a runnable {@link
 * PersistedTask}.
 *
 * @author Darryl L Pierce
 */
@Entity
@Table(name = "TaskProperties")
@NoArgsConstructor
@RequiredArgsConstructor
public class PersistedTaskProperty {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  private Long id;

  @ManyToOne
  @JoinColumn(name = "TaskId", nullable = false, updatable = false)
  @Getter
  @NonNull
  private PersistedTask task;

  @Column(name = "Name", length = 128, nullable = false, updatable = false, insertable = true)
  @Getter
  @Setter
  @NonNull
  private String name;

  @Column(name = "Value", length = 1024, nullable = false, updatable = false, insertable = true)
  @Getter
  @Setter
  @NonNull
  private String value;

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final PersistedTaskProperty that = (PersistedTaskProperty) o;
    return Objects.equals(task, that.task)
        && Objects.equals(name, that.name)
        && Objects.equals(value, that.value);
  }

  @Override
  public int hashCode() {
    return Objects.hash(task, name, value);
  }
}
