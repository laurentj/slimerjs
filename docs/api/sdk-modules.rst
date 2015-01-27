
===========
SDK Modules
===========

SlimerJS allows you to use some of Mozilla's AddOn SDK modules as well as some Core modules.

Core Modules
------------

Modules below can be imported with ``require('core-modules/<NAME>')``, where name is name of the module in dash-case (``FileUtils`` becomes ``file-utils``).
All of those modules export single object named as in MDN documentation.

 - `Sqlite <https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Sqlite.jsm>`__
 - `Task <https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Task.jsm>`__
 - `FileUtils <https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/FileUtils.jsm>`__
 - `DateUtils <https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/DateUtils.jsm>`__
 - `NetUtil <https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/NetUtil.jsm>`__



Add-On SDK modules
------------------

List of Add-On SDK modules, which can be imported with ``require('sdk/<PATH>')``).
Detailed documentation can be found in `MDN documentation <https://developer.mozilla.org/en-US/Add-ons/SDK>`__ (in High-Level and Low-Level APIs tabs).

**Note**: Some of the modules can be outdated.


Low-Level APIs
==============

 - ``core/heritage`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/core_heritage>`__
 - ``code/namespace`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/core_namespace>`__
 - ``code/promise`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/core_promise>`__
 - ``core/disposable``

 - ``event/core`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/event_core>`__
 - ``event/chrome``
 - ``event/dom``
 - ``event/target`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/event_target>`__
 - ``event/utils``

 - ``io/file`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/io_file>`__
 - ``io/byte-streams`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/io_byte-streams>`__
 - ``io/text-streams`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/io_text-streams>`__

 - ``lang/type`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/lang_type>`__
 - ``lang/weak-set``
 - ``lang/functional`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/lang_functional>`__

 - ``net/url`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/net_url>`__
 - ``net/xhr`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/net_xhr>`__

 - ``platform/xpcom`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/platform_xpcom>`__

 - ``system/environment`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/system_environment>`__
 - ``system/events`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/system_events>`__
 - ``system/globals``
 - ``system/runtime`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/system_runtime>`__
 - ``system/unload`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/system_unload>`__
 - ``system/xul-app`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/system_xul-app>`__

 - ``util/array`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/util_array>`__
 - ``util/collection`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/util_collection>`__
 - ``util/deprecate`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/util_deprecate>`__
 - ``util/list`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/util_list>`__
 - ``util/object`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/util_object>`__
 - ``util/registry``
 - ``util/uuid`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/util_uuid>`__


High-Level APIs
===============

 - ``base64`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/base64>`__
 - ``clipboard`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/clipboard>`__
 - ``notifications`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/notifications>`__
 - ``querystring`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/querystring>`__
 - ``request`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/request>`__
 - ``selection`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/selection>`__
 - ``self`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/self>`__
 - ``system`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/system>`__
 - ``timers`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/timers>`__
 - ``url`` `(doc) <https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/url>`__


