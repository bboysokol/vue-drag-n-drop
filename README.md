# VUE-DRAG-N-DROP
[![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/Naereen/StrapDown.js/blob/master/LICENSE)
## What is this?
It's Vue library to handle custom drag and drop.

### How to install this component
```
npm install @bboysokol/vue-drag-n-drop --save
```

### Live demo

[live demo](https://przemyslawsokolowski.github.io/vue-drag-n-drop/)

# DraggableItem

## Props

|Name|Description|Type|Required|Default|
|---|---|---|---|---|
|id|-|`String`|`false`|-|
|list|-|`Array`|`false`|-|
|group|-|`Object`|`false`|-|
|item|-|`Object`|`false`|null|
|disabledClass|-|`String`|`true`|-|
|containerClass|-|`String`|`true`|-|
|parentContainerClass|-|`String`|`true`|-|
|draggingClass|-|`String`|`false`|-|
|additionalTransition|-|`String`|`false`|-|
|answerSlot|-|`Boolean`|`false`|-|

## Events

|Event Name|Description|Parameters|
|---|---|---|
|change|-|-|
|start|-|-|
|end|-|-|

## Slots

|Name|Description|Default Slot Content|
|---|---|---|
|default|-|-|




