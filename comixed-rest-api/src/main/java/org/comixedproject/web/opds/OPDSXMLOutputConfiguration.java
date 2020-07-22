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

package org.comixedproject.web.opds;

import com.fasterxml.jackson.core.io.IOContext;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.dataformat.xml.XmlFactory;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.fasterxml.jackson.dataformat.xml.ser.ToXmlGenerator;
import com.fasterxml.jackson.dataformat.xml.util.StaxUtil;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Collections;
import java.util.Map;
import java.util.Objects;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamWriter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.http.converter.xml.MappingJackson2XmlHttpMessageConverter;

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
  public MappingJackson2XmlHttpMessageConverter mappingJackson2XmlHttpMessageConverter(
      Jackson2ObjectMapperBuilder builder) {

    String defaultNamespace = "http://www.w3.org/2005/Atom";
    Map<String, String> otherNamespaces =
        Collections.singletonMap("pse", "http://vaemendis.net/opds-pse/ns");

    XmlMapper xmlMapper = new XmlMapper(new NamespaceXmlFactory(defaultNamespace, otherNamespaces));
    xmlMapper.enable(SerializationFeature.INDENT_OUTPUT);
    xmlMapper.enable(ToXmlGenerator.Feature.WRITE_XML_DECLARATION);

    return new MappingJackson2XmlHttpMessageConverter(xmlMapper);
  }

  class NamespaceXmlFactory extends XmlFactory {

    private final String defaultNamespace;
    private final Map<String, String> prefix2Namespace;

    public NamespaceXmlFactory(String defaultNamespace, Map<String, String> prefix2Namespace) {
      this.defaultNamespace = Objects.requireNonNull(defaultNamespace);
      this.prefix2Namespace = Objects.requireNonNull(prefix2Namespace);
    }

    @Override
    protected XMLStreamWriter _createXmlWriter(IOContext context, OutputStream out)
        throws IOException {
      XMLStreamWriter writer = super._createXmlWriter(context, out);
      try {
        writer.setDefaultNamespace(defaultNamespace);
        for (Map.Entry<String, String> e : prefix2Namespace.entrySet()) {
          writer.setPrefix(e.getKey(), e.getValue());
        }
      } catch (XMLStreamException e) {
        StaxUtil.throwAsGenerationException(e, null);
      }
      return writer;
    }
  }
}
