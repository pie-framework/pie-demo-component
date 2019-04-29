![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# PIE Demo

A Custom Element for demonstrating a PIE interaction designed for use with the pie-cloud packaging service.

```html
<pie-demo
   editor="true" 
   pie="@pie-element/multiple-choice"
  >

</pie-demo>
```

## Setup

    npm install



## Development

Edit `src/index.html` with the name and version of the element you want to demo. And also alter the model.

Example
```html
<pie-demo id="demo" editor="true" pie="@pie-element/ebsr@1.2.0"></pie-demo>

  <script>
    const model = {
      "id": "0",
      "element": "pie-element-ebsr",
      "partA": {
        "prompt": "What color is the sky?",
        "choiceMode": "radio",
        "keyMode": "numbers",
        "choices": [
          {
            "value": "yellow",
            "label": "<div>Yellow</div>",
            "correct": false
          },
          {
            "value": "green",
            "label": "<div>Green</div>",
            "correct": false
          },
          {
            "correct": true,
            "value": "blue",
            "label": "<div>Blue</div>"
          }
        ],
        "partialScoring": false,
        "partialScoringLabel": "Each correct response that is correctly checked and each incorrect response\n          that is correctly unchecked will be worth 1 point.\n          The maximum points is the total number of answer choices.",
        "shuffle": false,
        "showCorrect": false
      },
      "partB": {
        "prompt": "What color do you get when you mix Red with your answer in Part 1?",
        "choiceMode": "radio",
        "keyMode": "numbers",
        "choices": [
          {
            "value": "orange",
            "label": "<div>Orange</div>",
            "correct": false
          },
          {
            "correct": true,
            "value": "purple",
            "label": "<div>Purple</div>"
          },
          {
            "value": "pink",
            "label": "<div>Pink</div>"
          },
          {
            "value": "green",
            "label": "<div>Green</div>"
          }
        ],
        "partialScoring": false,
        "partialScoringLabel": "Each correct response that is correctly checked and each incorrect response\n          that is correctly unchecked will be worth 1 point.\n          The maximum points is the total number of answer choices.",
        "shuffle": false
      }
    };
    const configure = {
      promptLabel: "Prompt",
      addChoiceButtonLabel: "Add a choice",
      addChoice: false,
      addFeedBack: true,
      deleteChoice: true,
      showPrompt: true,
      answerChoiceCount: 0,
      settingsSelectChoiceMode: true,
      settingsSelectChoicePrefixes: true,
      settingsSelectChoiceModeLabel: "Response Type",
      settingsChoicePrefixesLabel: "Choice Labels",
      settingsPartialScoring: true,
      settingsConfigShuffle: true
    };
    const pieDemo = document.getElementById("demo");
    pieDemo.model = model;
    pieDemo.configure = configure;
    pieDemo.modelSchemaJSONURI = 'https://raw.githubusercontent.com/pie-framework/pie-elements/develop/packages/categorize/docs/pie-schema.json';
    pieDemo.configureSchemaJSONURI = 'https://raw.githubusercontent.com/pie-framework/pie-elements/develop/packages/categorize/docs/config-schema.json';
  </script>
```

### Testing

Run e2e and unit tests:

    npm run test

### Local Devt

Launch the local `index.html` in hot-module-reload server:

    npm run start    



## Notes

When running `npm start` the HMR will attampt to re-define the custom element and get an already defined error. Need to refresh the page.

TODO

make script loading optional (but still define custome elements from pre-loaded)
