/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.model.library;

import com.fasterxml.jackson.annotation.*;
import java.util.Date;
import java.util.Objects;
import javax.persistence.*;
import lombok.*;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.views.View;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

/**
 * <code>LastRead</code> holds the date and time for when a user last read a specific comic.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "LastReadDates")
@JsonIdentityInfo(generator = ObjectIdGenerators.UUIDGenerator.class, property = "@id")
@NoArgsConstructor
@RequiredArgsConstructor
public class LastRead {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonView({View.UserDetailsView.class, View.AuditLogEntryDetail.class})
  @Getter
  private Long id;

  @ManyToOne
  @JoinColumn(name = "ComicId", insertable = true, updatable = false, nullable = false)
  @JsonProperty("comic")
  @JsonView({View.LastReadList.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  @NonNull
  private Comic comic;

  @ManyToOne
  @JoinColumn(name = "UserId", insertable = true, updatable = false, nullable = false)
  @Getter
  @Setter
  @NonNull
  private ComiXedUser user;

  @Column(name = "LastReadOn", insertable = true, updatable = false, nullable = false)
  @JsonProperty("lastRead")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  @JsonView({View.LastReadList.class, View.AuditLogEntryDetail.class})
  @Getter
  @Setter
  private Date lastRead = new Date();

  @Column(name = "CreatedOn", updatable = false, nullable = false)
  @CreatedDate
  @Getter
  @JsonView({View.LastReadList.class, View.AuditLogEntryDetail.class})
  private Date createdOn = new Date();

  @Column(name = "LastModifiedOn", nullable = false, updatable = true)
  @LastModifiedDate
  @Getter
  @Setter
  @JsonView({View.LastReadList.class, View.AuditLogEntryDetail.class})
  private Date lastModifiedOn = new Date();

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final LastRead that = (LastRead) o;
    return Objects.equals(comic, that.comic)
        && Objects.equals(user, that.user)
        && Objects.equals(lastRead, that.lastRead);
  }

  @Override
  public int hashCode() {
    return Objects.hash(comic, user, lastRead);
  }
}
