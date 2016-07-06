/*
 ngFieldEdit v0.0.1
 (c) 2016 Gildson
*/
angular.module('ng-field-edit', [])
  .run(['$templateCache', function($templateCache){
    // showing text
    $templateCache.put('template/ng-field-edit_data[text].html', '<p class="form-control-static" ng-show="visible" ng-bind="form.data[field] || contentEmpty"></p>');
    // showing check
    $templateCache.put('template/ng-field-edit_data[check].html', '<p class="form-control-static" ng-show="visible" ng-bind="form.data[field] ? contentTrue : contentFalse"></p>');
    // showing combo
    $templateCache.put('template/ng-field-edit_data[combo].html', '<p class="form-control-static" ng-show="visible" ng-bind="getOption(form.data[field]).description || contentEmpty"></p>');
    // editing text
    $templateCache.put('template/ng-field-edit_field[text].html', '<input class="form-control" type="text" ng-model="form.data[field]" ng-readonly="!editable && !form.waiting" ng-disabled="form.waiting" ng-show="visible">');
    // editing check
    $templateCache.put('template/ng-field-edit_field[check].html', '<div class="checkbox"><label><input type="checkbox" ng-model="form.data[field]" ng-readonly="!editable && !form.waiting" ng-disabled="form.waiting" ng-show="visible"> <span ng-bind="contentDescription"></span></label></div>');
    // editing combo
    $templateCache.put('template/ng-field-edit_field[combo].html', '<select class="form-control" ng-model="form.data[field]" ng-readonly="!editable && !form.waiting" ng-disabled="form.waiting" ng-options="op.value as op.description for op in options"></select>');

  }])
  .factory('feFormData', function(){
    return function(){
      return {
        data: undefined, 
        _data: undefined, 
        visible: true,
        adding: false,
        editing: false, 
        waiting: true,
        save: function(){
          this.adding = false;
          this.editing = false;
          this.waiting = true;
          angular.merge(this._data, this.data);
          this.reset();
        },
        new: function(){
          this.adding = true;
          this.editing = false;
          this.waiting = false;
          this.data = {};
          this._data = this.data;
        },
        edit: function(){
          this.adding = false;
          this.editing = true;
          this.waiting = false;
        }, 
        cancel: function(){
          this.adding = false;
          this.editing = false;
          this.waiting = true;
          // this.reset();
        },
        reset: function(){
          this.data = angular.copy(this._data);
        }, 
        setData: function(data){
          this._data = (data == undefined ? '' : data);
          this.data = angular.copy(this._data);
        }
      };
    };
  })
  .directive('ngFormFieldEdit', ['feFormData', function(feFormData){
    return {
      restrict: 'A',
      replace: true,
      template: '',
      scope: {
        form: '=ngFormFieldEdit',
        data: '=?ffeData'
      },
      link: function(scope, element, attrs){

        // form back to initial state
        scope.reset = function(){
          scope.form = feFormData();
          scope.update();
        };

        scope.update = function(){
          scope.form = (scope.form == undefined ? feFormData() : scope.form);
          scope.form.setData(scope.data ? scope.data : {});
        };

        scope.$watch('data', function(){
          scope.update();
        }, true);

        // init form
        scope.reset();
      }
    }
  }])
  .directive('ngFieldEdit', ['$compile', '$templateCache', 'feFormData', function($compile, $templateCache, feFormData){
    return {
      restrict: 'A', 
      replace: true, 
      scope: {
        form:              '=?feForm', 
        field:             '=?feField', 
        data:              '=?feData', 
        editable:          '=?feEditable', 
        visible:           '=?feVisible', 
        contentDescription:'=?feContentDescription', 
        contentTrue:       '=?feContentTrue', 
        contentFalse:      '=?feContentFalse', 
        contentEmpty:      '=?feContentEmpty',
        options:           '=?feOptions',
        alwaysShowField:   '=?feAlwaysShowField',
        defaultValue:      '=?feDefaultValue',
        extra:             '=?feExtra'
      },
      link: function(scope, element, attrs){

        // identify when data own one namespace by not found a field to data
        scope.ns_data = false;
        scope.editable = (scope.editable == undefined ? true : scope.editable);
        scope.visible = (scope.visible == undefined ? true : scope.visible);
        scope.contentDescription = (scope.contentDescription ? scope.contentDescription : '');
        scope.contentTrue = (scope.contentTrue ? scope.contentTrue : '');
        scope.contentFalse = (scope.contentFalse ? scope.contentFalse : '');
        scope.contentEmpty = (scope.contentEmpty ? scope.contentEmpty : 'empty');
        scope.options = (scope.options ? scope.options : []);
        scope.alwaysShowField = (scope.alwaysShowField == undefined ? false : scope.alwaysShowField);
        // when don't exists form, create one
        scope.form = (scope.form == undefined ? feFormData() : scope.form);
        // when field is not implemented then create base field(data)
        if(scope.field == undefined){
          scope.form.setData({data: scope.data});
          scope.field = 'data';
          scope.ns_data = true;
        }else if(scope.form._data == undefined){
          scope.form.setData(scope.data);
        }

        /****************
         * internal
         ****************/
        // manage what template use
        scope.getTemplate = function(){

          switch(attrs.ngFieldEdit){
            case 'text':
              return $templateCache.get(scope.form.editing || scope.alwaysShowField ? 'template/ng-field-edit_field[text].html' : 'template/ng-field-edit_data[text].html');

            case 'check':
              return $templateCache.get(scope.form.editing || scope.alwaysShowField ? 'template/ng-field-edit_field[check].html' : 'template/ng-field-edit_data[check].html');

            case 'combo':
              return $templateCache.get(scope.form.editing || scope.alwaysShowField ? 'template/ng-field-edit_field[combo].html' : 'template/ng-field-edit_data[combo].html');

          }
        };

        scope.getOption = function(value){
          // 
          for(var n = 0; n < scope.options.length; n++){
            if(scope.options[n].value == value){
              return scope.options[n];
            }
          }
          return {};
        };

        scope.updateTemplate = function(){
          element.html(scope.getTemplate());
          $compile(element.contents())(scope);
        };

        /****************
         * watchs
         ****************/
        scope.$watch('form.adding', function(){
          if(scope.form.adding && scope.defaultValue !== undefined){
            scope.form.data[scope.field] = scope.defaultValue;
          }
        }, true);
        scope.$watch('form.editing', scope.updateTemplate);
        scope.$watch('form._data', function(){
          // when namespace is used
          if(scope.ns_data){
            scope.data = scope.form._data[scope.field];
          }
        }, true);

      }
    }
  }]);