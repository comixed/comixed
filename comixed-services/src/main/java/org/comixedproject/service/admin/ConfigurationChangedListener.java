package org.comixedproject.service.admin;

/**
 * <code>ConfigurationChangedListener</code> defines a type that is notified when configuration
 * options are changed.
 *
 * @author Darryl L. Pierce
 */
public interface ConfigurationChangedListener {
  /**
   * Invoked when a configuration option is changed.
   *
   * @param name the option name
   * @param newValue the new value
   */
  public void optionChanged(String name, String newValue);
}
