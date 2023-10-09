/*
 * ComiXed - A digital comicBook book library management application.
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
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.views.View;
import org.springframework.data.annotation.CreatedDate;

/**
 * <code>LastRead</code> holds the date and time for when a user last read a specific comicBook.
 *
 * @author Darryl L. Pierce
 */
@Entity
@Table(name = "last_read_dates")
@NoArgsConstructor
@RequiredArgsConstructor
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class LastRead {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @JsonView({View.UserDetailsView.class, View.ComicDetailsView.class})
  @Getter
  private Long id;

  @ManyToOne
  @JoinColumn(name = "comic_detail_id", insertable = true, updatable = false, nullable = false)
  @JsonProperty("comicDetail")
  @JsonView({View.ComicDetailsView.class})
  @Getter
  @Setter
  @NonNull
  private ComicDetail comicDetail;

  @ManyToOne
  @JoinColumn(name = "comixed_user_id", insertable = true, updatable = false, nullable = false)
  @Getter
  @Setter
  @NonNull
  private ComiXedUser user;

  @Column(name = "last_read_on", insertable = true, updatable = false, nullable = false)
  @JsonProperty("lastRead")
  @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
  @JsonView({View.ComicDetailsView.class})
  @Getter
  @Setter
  private Date lastReadOn = new Date();

  @Column(name = "created_on", updatable = false, nullable = false)
  @CreatedDate
  @Getter
  @JsonView({View.ComicDetailsView.class})
  private Date createdOn = new Date();

  @Override
  public boolean equals(final Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    final LastRead that = (LastRead) o;
    return Objects.equals(comicDetail, that.comicDetail)
        && Objects.equals(user, that.user)
        && Objects.equals(lastReadOn, that.lastReadOn);
  }

  @Override
  public int hashCode() {
    return Objects.hash(comicDetail, user, lastReadOn);
  }
}
