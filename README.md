google-search-results-parser
====================
[![Build Status](https://travis-ci.org/ogt/google-search-results-parser.png)](https://travis-ci.org/ogt/google-search-results-parser)

Parses  results from the HTML of  google search page results into json.

### Usage:

```javascript
  var parser = require('google-search-ads-parser')
  parser.parseFile('./test/data/example.html');
  parser.parseFile('./test/data/moto-g.html');
    console.log(result);
  });
```

### Result format:

--
This module takes as input the HTML from a google search results and return a json structure of the following form
```
query_string : "",
results : [
    {
        Domain :
        Title
        URL
        Text
        Extensions : {
           PublishedBy : { // http://cl.ly/1D3J0F262o2E
               Photo :
               Who :
               Date :
               Followers :
           }
           Sitelinks : [   // http://cl.ly/3l0H1U390R0b
               {
                   Title
                   URL
                   Text
               }
               ..

           ]
        }

    }
    ...
]
```
