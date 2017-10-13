.. index:: Addons

================================
Creating addons for SlimerJS
================================

Since SlimerJS is using Firefox's framework, it is theorically possible to
create and install XUL addons for SlimerJS. But it works only if you are using Firefox 56
or lower. The support of XUL addons has been removed in Firefox 57+. And the support
of WebExtensions has not been yet tested with SlimerJS.

With Firefox 56-, even it is possible, it's not so easy to install XUL addons:

- Their installation is not easy since their are no user interface to install them.
- An addon made for Firefox may not work with SlimerJS because :
   - the user interface is not the same, so the addon may not found
     what it wants. For example, there is no toolbar to add a button, so
     the extension code may not work when it wants to add a button.
   - the install.rdf manifest of an addon may only refer to Firefox as
     application target. The addon should at least refers to the mozilla toolkit
     (see below).

However, this is not impossible. Here are some tips.

Warning: to understand following instructions, you need to learn how to create
addons for Firefox first. See `documentation on MDN <https://developer.mozilla.org/en-US/Add-ons/Legacy_add_ons>`_.


Steps to install extensions:

- 1. set targetApplication to toolkit@mozilla.org (install.rdf)
   SlimerJS doesn't run extensions dedicated to firefox. Your extension must
   either be dedicated to targetApplication ``slimerjs@slimerjs.org`` or in case
   of a hybrid extension more generically to ``toolkit@mozilla.org``.

   **extensions/{Extension_ID}/install.rdf**

   .. code-block:: xml

    <em:targetApplication>
     <Description>
       <em:id>toolkit@mozilla.org</em:id>
       <em:minVersion>0.*</em:minVersion>
       <em:maxVersion>99.*</em:maxVersion>
     </Description>
    </em:targetApplication>

- 2. EnableExtensionManager=1 (application.ini)
   In order to convince SlimerJS to run extension, an addition to its
   application.ini is required.

   **slimerjs/application.ini**

   .. code-block:: bash

    [XRE]
    EnableExtensionManager=1

- 3. Set User Prefs enabledAddons (prefs.js)
   Add-ons need to be enabled. As a UI is missing to enable the add-on, you need
   to set the configuration manually. This is done in the profile dir prefs.js
   file. The preference contains a comma-separated list of Extension_IDs + their
   version. This must fit to ``<em:id>...</em:id>`` and
   ``<em:version>...</em:version>`` of the extensions install.rdf (see step 1).
   Remember to run SlimerJS with your profile: ``-profile ...``.

   **profile/prefs.js**

   .. code-block:: javascript

    user_pref("extensions.enabledAddons", "{EXTENSION_ID}:{VERSION},..");

- 4. Set User Prefs extensions.xpiState (prefs.js)
   Add-ons need to be loaded. As a UI is missing to load an extension, you need
   to set user preferences manually. This is done in the profile dir prefs.js
   file. The value is a JSON object (be careful with masking quots and
   structure). You need to set EXTENSION_ID, realFolderToExtension and VERSION
   accordingly. The timestamps fields (st and mt) should be filled with recent
   timestamps. Everything in the near past should do.
   Remember to run SlimerJS with your profile: ``-profile ...``.

   **profile/prefs.js**

   .. code-block:: javascript

    user_pref("extensions.xpiState", "{\"app-profile\":{\"#EXTENSION_ID#\":{\"d\":\"#realFolderToExtension#\",\"e\":true,\"v\":\"#VERSION#\",\"st\":1450636700000,\"mt\":1447437723000}}}");

- 5. Set correct overlay (chrome.manifest)
   As SlimerJS doesn't come with browser.xul, your extension need to overlay the
   slimerjs.xul or webpage.xul instead, if your extension uses overlays at all.

   **extensions/{Extension_ID}/chrome.manifest**

   .. code-block:: bash

    overlay   chrome://slimerjs/content/webpage.xul chrome://path/to/your/overlay.xul

    Note: SlimerJS is supposed to not have a user interface. Avoid to use
    overlays to add some user interface components, since in a "ghost" context,
    (like running tests on the CI plateform...), nobody will click on buttons
    of the user interface ;)
    

Also see `documentation on MDN <https://developer.mozilla.org/en-US/Add-ons>`_.


One additional hint: Many Firefox extensions are using `Fuel <https://developer.mozilla.org/en-US/docs/Mozilla/Tech/Toolkit_API/FUEL>`_.
SlimerJS doesn't include Fuel and this application Interface is deprecated
anyway. Use SDK components instead. The following example shows both versions
for accessing extension information.

**Fuel**

.. code-block:: javascript

    var app = Cc["@mozilla.org/fuel/application;1"].getService(Ci.fuelIApplication);
    app.getExtensions(function (extensions) {
      constants.VERSION = extensions.get(constants.EXTENSION_ID).version;
    });

**SDK**

.. code-block:: javascript

    Components.utils.import("resource://gre/modules/AddonManager.jsm");
    AddonManager.getAddonByID(constants.EXTENSION_ID, function(addon) {
      constants.VERSION = addon.version;
    });

