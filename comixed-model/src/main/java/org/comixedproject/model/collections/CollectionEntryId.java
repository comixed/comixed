package org.comixedproject.model.collections;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.io.Serializable;
import lombok.Getter;
import lombok.Setter;
import org.comixedproject.model.comicbooks.ComicTagType;

@Embeddable
public class CollectionEntryId implements Serializable {
  @Column(name = "tag_type")
  @Enumerated(EnumType.STRING)
  @Getter
  @Setter
  private ComicTagType tagType;

  @Column(name = "tag_value")
  @Getter
  @Setter
  private String tagValue;
}
