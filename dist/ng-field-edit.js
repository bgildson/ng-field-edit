angular.module('ng-field-edit', [])
  .run(['$templateCache', function($templateCache){
    // template to text [input]
    $templateCache.put('template/ng-field-edit_field_text.html', '<input type="text" ng-model="form.data[field]">');
    $templateCache.put('template/ng-field-edit_data_text.html', '{{ form.data[field] }}');

    // template to link [input]
    $templateCache.put('template/ng-field-edit_field_link.html', '<input type="text" ng-model="form.data[field]">');
    $templateCache.put('template/ng-field-edit_data_link.html', '<a href="#" ng-click="form.edit()">{{ form.data[field] }}</a>');

    // template to text-save [input-save-cancel]
    $templateCache.put('template/ng-field-edit_field_text-save.html', '<input type="text" ng-model="form.data[field]"><button ng-click="form.save()">save</button><button ng-click="form.cancel()">cancel</button>');
    $templateCache.put('template/ng-field-edit_data_text-save.html', '{{ form.data[field] }}');

    // template to link-save [text_input-btn_save-btn_cancel]
    $templateCache.put('template/ng-field-edit_field_link-save.html', '<input type="text" ng-model="form.data[field]"><button ng-click="form.save()">save</button><button ng-click="form.cancel()">cancel</button>');
    $templateCache.put('template/ng-field-edit_data_link-save.html', '<a href="#" ng-click="form.edit()">{{ form.data[field] }}</a>');
  }])
  .factory('feFormData', function(){
    return function(){
      return {
        data: undefined, 
        _data: undefined, 
        visible: true, 
        editing: false, 
        enable: true, 
        waiting: false, 
        save: function(){
          angular.merge(this._data, this.data);
          this.data = angular.copy(this._data);
          this.editing = false;
          console.log('form.save()');
        }, 
        edit: function(){
          this.editing = true;
          console.log('form.edit()');
        }, 
        cancel: function(){
          this.reset();
          this.editing = false;
          console.log('form.cancel()');
        }, 
        reset: function(){
          this.data = angular.copy(this._data);
          console.log('form.reset()');
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
        ngFormFieldEdit: '=ngFormFieldEdit',
        data: '=ffeData'
      },
      link: function(scope, element, attrs){
        
        scope.ngFormFieldEdit = (scope.ngFormFieldEdit == undefined ? feFormData() : scope.ngFormFieldEdit);
        scope.ngFormFieldEdit.setData(scope.data);

      }
    }
  }])
  .directive('ngFieldEdit', ['$compile', '$templateCache', 'feFormData', function($compile, $templateCache, feFormData){
    return {
      restrict: 'A', 
      replace: true, 
      scope: {
        form:     '=?feForm', 
        field:    '=?feField', 
        data:     '=?feData', 
        extra:    '=?feExtra'
      },
      link: function(scope, element, attrs){

        // identify when data own one namespace by not found a field to data
        scope.ns_data = false;

        // when don't exists form, create new
        scope.form = (scope.form == undefined ? feFormData() : scope.form);
        scope.form.setData(scope.data);
        // when field is not implemented then create base field(data)
        if(scope.field == undefined){
          scope.form.setData({data: scope.form._data});
          // scope.form._data = {data: scope.form._data};
          scope.field = 'data';
          scope.ns_data = true;
        }

        /****************
         * internal
         ****************/
        // manage what template use
        scope.getTemplate = function(){
          switch(attrs.ngFieldEdit){
            case 'text':
              return $templateCache.get(scope.form.editing ? 'template/ng-field-edit_field_text.html': 'template/ng-field-edit_data_text.html');

            case 'link':
              return $templateCache.get(scope.form.editing ? 'template/ng-field-edit_field_link.html': 'template/ng-field-edit_data_link.html');

            case 'text-save':
              return $templateCache.get(scope.form.editing ? 'template/ng-field-edit_field_text-save.html': 'template/ng-field-edit_data_text-save.html');

            case 'link-save':
              return $templateCache.get(scope.form.editing ? 'template/ng-field-edit_field_link-save.html': 'template/ng-field-edit_data_link-save.html');

          }
        };

        scope.updateTemplate = function(){
          element.html(scope.getTemplate());
          $compile(element.contents())(scope);
        };
 
        scope.$watch('form.editing', scope.updateTemplate);
        scope.$watch('form.enable', scope.updateTemplate);
        scope.$watch('form._data', function(){
          // when namespace is used
          if(scope.ns_data){
            scope.data = scope.form._data[scope.field];
          }
        }, true);

      }
    }
  }]);