/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.plugins.interpreters;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.plugins.runners.PluginRunner;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * <code>PluginInterpreterLoader</code> loads the configuration for the langauge interpreters for
 * running plugins.
 *
 * @author Darryl L. Pierce
 */
@Component
@EnableConfigurationProperties
@PropertySource("classpath:plugin-languages.properties")
@ConfigurationProperties(prefix = "plugin.language", ignoreUnknownFields = false)
@Log4j2
public class PluginInterpreterLoader implements InitializingBean {
  @Autowired private ApplicationContext context;
  @Autowired private PluginRunner pluginRunner;

  private List<PluginInterpreterEntry> runtimes = new ArrayList<>();
  private Map<String, String> interpreters = new HashMap<>();

  public List<PluginInterpreterEntry> getRuntime() {
    return runtimes;
  }

  @Override
  public void afterPropertiesSet() throws Exception {
    this.interpreters.clear();
    log.debug("Loading plugin languages");
    for (int index = 0; index < this.runtimes.size(); index++) {
      PluginInterpreterEntry entry = this.runtimes.get(index);

      if (entry.isValid()) {
        String language = entry.getLanguage();
        String bean = entry.getInterpreter();

        if (this.interpreters.containsKey(language)) {
          log.error("Already have plugin interpreter for {}", language);
        } else if (!this.context.containsBean(bean)) {
          log.error("No such bean: {}", bean);
        } else if (!this.context.isPrototype(bean)) {
          log.error("Not a prototype: {}", bean);
        } else {
          log.debug("Registering interpreter bean for language: {}", language);
          this.interpreters.put(language, bean);
        }
      }
    }
  }

  /**
   * Reports if the specified language is supported.
   *
   * @param language the language
   * @return <code>true</code> if supported
   */
  public boolean hasLanguage(String language) {
    return this.interpreters.containsKey(language);
  }

  /**
   * Returns the interpreter for the specified langauge.
   *
   * @param language the language
   * @return the interpreter
   */
  public PluginInterpreter getLanguage(String language) {
    log.debug("Retrieving interpreter: language={}", language);
    log.debug("Returning instance");
    return (PluginInterpreter) this.context.getBean(language);
  }

  public static class PluginInterpreterEntry {
    private String language;
    private String interpreter;

    public PluginInterpreterEntry() {}

    public String getLanguage() {
      return language;
    }

    public void setLanguage(String language) {
      this.language = language;
    }

    public String getInterpreter() {
      return interpreter;
    }

    public void setInterpreter(String interpreter) {
      this.interpreter = interpreter;
    }

    public boolean isValid() {
      return !StringUtils.isEmpty(this.language) && !StringUtils.isEmpty((this.interpreter));
    }
  }
}
