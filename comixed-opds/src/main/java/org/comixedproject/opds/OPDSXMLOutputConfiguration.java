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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

package org.comixedproject.opds;

import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamWriter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.xml.JacksonXmlHttpMessageConverter;
import tools.jackson.databind.SerializationFeature;
import tools.jackson.dataformat.xml.XmlFactory;
import tools.jackson.dataformat.xml.XmlMapper;
import tools.jackson.dataformat.xml.XmlWriteFeature;
import tools.jackson.dataformat.xml.util.StaxUtil;

/**
 * <code>OPDSXMLOutputConfiguration</code> Configures xmlMapper and adds support to extra namespaces
 * in fasterxmljackson xml writer
 *
 * @author João França
 * @author Giao Phan
 * @author Darryl L. Pierce
 */
@Configuration
public class OPDSXMLOutputConfiguration {

  @Bean
  public JacksonXmlHttpMessageConverter jacksonXmlHttpMessageConverter() {

    final String defaultNamespace = "http://www.w3.org/2005/Atom";
    final Map<String, String> otherNamespaces = new HashMap<>();
    otherNamespaces.put("opds", "http://opds-spec.org/2010/catalog");
    otherNamespaces.put("opensearch", "http://a9.com/-/spec/opensearch/1.1/");
    XmlMapper.Builder builder =
        XmlMapper.builder(new NamespaceXmlFactory(defaultNamespace, otherNamespaces));

    builder.enable(SerializationFeature.INDENT_OUTPUT);
    builder.enable(XmlWriteFeature.WRITE_XML_DECLARATION);

    final XmlMapper xmlMapper = new XmlMapper(builder);

    return new JacksonXmlHttpMessageConverter(xmlMapper);
  }

  static class NamespaceXmlFactory extends XmlFactory {

    private final String defaultNamespace;
    private final Map<String, String> prefix2Namespace;

    public NamespaceXmlFactory(String defaultNamespace, Map<String, String> prefix2Namespace) {
      this.defaultNamespace = Objects.requireNonNull(defaultNamespace);
      this.prefix2Namespace = Objects.requireNonNull(prefix2Namespace);
    }

    @Override
    protected XMLStreamWriter _createXmlWriter(OutputStream out) {
      var writer = super._createXmlWriter(out);
      try {
        writer.setDefaultNamespace(defaultNamespace);
        for (Map.Entry<String, String> e : prefix2Namespace.entrySet()) {
          writer.setPrefix(e.getKey(), e.getValue());
        }
      } catch (XMLStreamException e) {
        StaxUtil.throwAsWriteException(e, null);
      }
      return writer;
    }
  }
}
