package org.comixedproject.model.comicfiles;

import java.util.Date;
import java.util.Objects;
import javax.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

/**
 * <code>ComicFileDescriptor</code> represents the details needed for importing a comic file into
 * the library.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "ComicFileDescriptors")
@NoArgsConstructor
@RequiredArgsConstructor
public class ComicFileDescriptor {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Getter
  private Long id;

  @Column(name = "Filename", nullable = false, updatable = false, unique = true)
  @Getter
  @NonNull
  private String filename;

  @Column(name = "CreatedOn", nullable = false, updatable = false)
  @Getter
  private Date createdOn = new Date();

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final ComicFileDescriptor that = (ComicFileDescriptor) o;
    return filename.equals(that.filename);
  }

  @Override
  public int hashCode() {
    return Objects.hash(filename);
  }
}
