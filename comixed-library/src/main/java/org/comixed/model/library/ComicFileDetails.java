/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.model.library;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import org.comixed.views.View.ComicDetails;

import javax.persistence.*;

@Entity
@Table(name = "comic_file_details")
public class ComicFileDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    @JsonView({ComicDetails.class})
    private Long id;

    @OneToOne
    @JoinColumn(name = "comic_id",
                nullable = false,
                updatable = false)
    private Comic comic;

    @Column(name = "file_hash",
            length = 32,
            nullable = false,
            updatable = true)
    @JsonView({ComicDetails.class})
    private String hash;

    public ComicFileDetails() {}

    public Long getId() { return id; }

    public Comic getComic() { return comic; }

    public void setComic(final Comic comic) { this.comic = comic; }

    public String getHash() { return hash; }

    public void setHash(final String hash) { this.hash = hash; }
}
