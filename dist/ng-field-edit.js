/*
 ngFieldEdit v0.0.1
 (c) 2016 Gildson
*/
angular.module('ng-field-edit', [])
  .run(['$templateCache', function($templateCache){
    // showing text
    $templateCache.put('template/ng-field-edit_data[text].html', '<span ng-show="visible">{{ form.data[field] || contentEmpty }}</span>');
    // showing link
    $templateCache.put('template/ng-field-edit_data[link].html', '<a href="" ng-click="form.edit()" ng-show="visible">{{ form.data[field] ? form.data[field] : contentEmpty }}</a>');
    // showing check
    $templateCache.put('template/ng-field-edit_data[check].html', '<span ng-show="visible">{{ form.data[field] ? contentTrue : contentFalse }}</span>');
    // showing check-link
    $templateCache.put('template/ng-field-edit_data[check-link].html', '<a href="" ng-click="form.edit()" ng-show="visible">{{ form.data[field] ? contentTrue : contentFalse }}</a>');
    // showing combo
    $templateCache.put('template/ng-field-edit_data[combo].html', '<span ng-show="visible">{{ getOption(form.data[field]).description || contentEmpty }}</span>');
    // showing combo-link
    $templateCache.put('template/ng-field-edit_data[combo-link].html', '<a href="" ng-click="form.edit()" ng-show="visible">{{ getOption(form.data[field]).description || contentEmpty }}</a>');
    // editing text
    $templateCache.put('template/ng-field-edit_field[text].html', '<input class="form-control" type="text" ng-model="form.data[field]" ng-disabled="!editable" ng-show="visible">');
    // editing text-save
    $templateCache.put('template/ng-field-edit_field[text-save].html', '<div class="col-sm-6"><input class="form-control" type="text" ng-model="form.data[field]" ng-disabled="!editable" ng-show="visible"></div> <button class="btn btn-primary" ng-click="form.save()">save</button> <button class="btn btn-default" ng-click="form.cancel()">cancel</button>');
    // editing check
    $templateCache.put('template/ng-field-edit_field[check].html', '<input type="checkbox" ng-model="form.data[field]" ng-disabled="!editable" ng-show="visible"> {{ contentDescription }}');
    // editing check-save
    $templateCache.put('template/ng-field-edit_field[check-save].html', '<input type="checkbox" ng-model="form.data[field]" ng-disabled="!editable" ng-show="visible"> {{ contentDescription }} <button class="btn btn-primary" ng-click="form.save()">save</button> <button class="btn btn-default" ng-click="form.cancel()">cancel</button>');
    // editing combo
    $templateCache.put('template/ng-field-edit_field[combo].html', '<select class="form-control" ng-model="form.data[field]" ng-options="op.value as op.description for op in options"></select>');
    // editing combo-save
    $templateCache.put('template/ng-field-edit_field[combo-save].html', '<div class="col-sm-6"><select class="form-control" ng-model="form.data[field]" ng-options="op.value as op.description for op in options"></select></div> <button class="btn btn-primary" ng-click="form.save()">save</button> <button class="btn btn-default" ng-click="form.cancel()">cancel</button>');

  }])
  .factory('feFormData', function(){
    return function(){
      return {
        data: undefined, 
        _data: undefined, 
        visible: true, 
        editing: false, 
        waiting: false, 
        save: function(){
          angular.merge(this._data, this.data);
          this.data = angular.copy(this._data);
          this.editing = false;
        }, 
        edit: function(){
          this.editing = true;
        }, 
        cancel: function(){
          this.reset();
          this.editing = false;
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
        ngFormFieldEdit:'=ngFormFieldEdit', 
        data:           '=?ffeData'
      },
      link: function(scope, element, attrs){

        // form back to initial state
        scope.reset = function(){
          scope.ngFormFieldEdit = feFormData();
          scope.update();
        }

        scope.update = function(){
          scope.ngFormFieldEdit = (scope.ngFormFieldEdit == undefined ? feFormData() : scope.ngFormFieldEdit);
          scope.ngFormFieldEdit.setData(scope.data ? scope.data : {});
        }

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
            case 'text-text':
              return $templateCache.get(scope.form.editing ? 'template/ng-field-edit_field[text].html': 'template/ng-field-edit_data[text].html');

            case 'link-text':
              return $templateCache.get(scope.form.editing ? 'template/ng-field-edit_field[text].html': 'template/ng-field-edit_data[link].html');

            case 'text-check':
              return $templateCache.get(scope.form.editing ? 'template/ng-field-edit_field[check].html': 'template/ng-field-edit_data[check].html');

            case 'link-check':
              return $templateCache.get(scope.form.editing ? 'template/ng-field-edit_field[check].html': 'template/ng-field-edit_data[check-link].html');

            case 'text-text-save':
              return $templateCache.get(scope.form.editing ? 'template/ng-field-edit_field[text-save].html': 'template/ng-field-edit_data[text].html');

            case 'link-text-save':
              return $templateCache.get(scope.form.editing ? 'template/ng-field-edit_field[text-save].html': 'template/ng-field-edit_data[link].html');

            case 'text-check-save':
              return $templateCache.get(scope.form.editing ? 'template/ng-field-edit_field[check-save].html': 'template/ng-field-edit_data[check].html');

            case 'link-check-save':
              return $templateCache.get(scope.form.editing ? 'template/ng-field-edit_field[check-save].html' : 'template/ng-field-edit_data[check-link].html');

            case 'text-combo':
              return $templateCache.get(scope.form.editing ? 'template/ng-field-edit_field[combo].html' : 'template/ng-field-edit_data[combo].html');

            case 'link-combo':
              return $templateCache.get(scope.form.editing ? 'template/ng-field-edit_field[combo].html' : 'template/ng-field-edit_data[combo-link].html');

            case 'text-combo-save':
              return $templateCache.get(scope.form.editing ? 'template/ng-field-edit_field[combo-save].html' : 'template/ng-field-edit_data[combo].html');

            case 'link-combo-save':
              return $templateCache.get(scope.form.editing ? 'template/ng-field-edit_field[combo-save].html' : 'template/ng-field-edit_data[combo-link].html');

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