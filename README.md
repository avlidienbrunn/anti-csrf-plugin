No-CSRF
=======
A chrome plugin meant to serve as a client-side protection against CSRF attacks.
It strips cookies from non-GET cross-origin requests unless the request is
specifically user-initiated. 

This repository is forked from [avlidienbrunn's](https://github.com/avlidienbrunn/anti-csrf-plugin) plugin
and is based off of _Cross-Site Request Forgeries: Exploitation and Prevention_
written by Zeller et al (2008 rev).

Usage
-----
Upon being installed, the extension operates as intended and blocks any
cross-site non-GET requests that do not share the same top-level domain. If
the extension breaks website functionality, it may be disabled across the 
browser or across a single tab.

Chrome Store
------------
This extension can be found on the [Chrome Store](https://chrome.google.com/webstore/detail/no-csrf/amababajdpoioajiapncbkhcbpkncepk?hl=en&gl=US).
Versions uploaded to the chrome store are also tagged as releases in the git
repository.
