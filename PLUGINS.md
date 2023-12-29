# Overview

Part of customizing the behavior for ComiXed is the addition of plugins
that provide additional behaviors.


# Installing Plugins

Plugins can be located in any directory that is accessible by the ComiXed
server. But it is recommended that they be installed to ```$HOME/.comixed/plugins```
(or ```C:\Users\[your name]\.comixed\plugins``` if you're using Windows).

Once there, you can configure the plugin by logging into your server with
and admin account, navigating to the Plugins tab of the configuration page,
and clicking the **Add** button and entering the full path and filename
for the plugin.


# Writing Plugins

The following languages are currently supported for writing plugins:
 * Groovy

## Minimal Plugin Behavior

A plugin must provide methods that return the plugin's **name**, it's
**version**, and the **list of properties** that must be configured
in order to run the plugin.

### Plugin Name

The plugin name must be unique. It is used to identify the plugin both
when being configured and also when being displayed to the user.

### Plugin Version

The plugin version is displayed when listing plugins. Only one version of
a plugin can be installed at a time.

### Plugin Properties

The properties list the set of fixed values that need to be provided to
the plugin. The list of properties must be in the form of a map of
key/value pairs.


## Admin-Only Plugins

If a plugin is marked as **admin-only**, then only users with admin
privileges will be able to see the plugin.


# Available Properties

The following properties are available to the plugin when running:

 * ```log``` the logger used by the server
 * ```comicBookIds``` the selected comic book ids, as am instance of ```List<Long>```
 * ```comicBookService``` provides access to the comic book table
 * ```readingListService``` provides access to the reading list table

For the list of methods available on a service, please consult the Javadocs for
that service.


# Groovy Plugins

The minimal Groovy plugin will have the following:
```groovy
import org.comixedproject.model.plugin.LibraryPluginProperty

def plugin_name()       { return "Good Plugin" }
def plugin_version()    { return "1.2.3.4" }
def plugin_properties() {
    var property1 = LibraryPluginProperty.createProperty("test_property_1", 32, "")
    var property2 = LibraryPluginProperty.createRequiredProperty("test_property_2", 64, "default value")

    return [property1, property2]
}

print "Hello World!"
```

This plugin, when invoked, would simply print "Hello world!" to the logs.

This example, though, shows how to add two properties:
1. a regular property using ```LibraryPluginProperty.createProperty()```, and
1. a required property with a default value using ```LibraryPluginProperty.createRequiredProperty()```.

The ```LibraryPluginProperty``` provides these two methods to make defining
plugin properties easier.
