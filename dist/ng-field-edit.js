angular.module('ng-field-edit', [])
  .run(['$templateCache', function($templateCache){
    // template to text[input]
    $templateCache.put('template/ng-field-edit_field_text.html', '<input type="text" ng-model="form.data[field]"><button ng-click="form.save()">save</button><button ng-click="form.cancel()">cancel</button>');
    $templateCache.put('template/ng-field-edit_data_text.html', '{{ form.data[field] }}');

    // template to link[input]
    $templateCache.put('template/ng-field-edit_field_link.html', '<input type="text" ng-model="form.data[field]"><button ng-click="form.save()">save</button><button ng-click="form.cancel()">cancel</button>');
    $templateCache.put('template/ng-field-edit_data_link.html', '<a href="#" ng-click="form.edit()">{{ form.data[field] }}</a>');
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
          console.log('form.save()');
          this._data = angular.copy(this.data);
          this.editing = false;
        }, 
        edit: function(){
          console.log('form.edit()');
          this.editing = true;
        }, 
        cancel: function(){
          console.log('form.cancel()');
          this.reset();
          this.editing = false;
        }, 
        reset: function(){
          console.log('form.reset()');
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
        data: '=ffeData'
      },
      link: function(scope, element, attrs){

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

        // when don't exists form, create new
        scope.form = (scope.form == undefined ? feFormData() : scope.form);
        // verify if will manage a existent form with data
        if(scope.form.data == undefined){
          scope.form.data = (scope.data == undefined ? '' : scope.data);
        }
        // when field is not implemented then create base field(data)
        if(scope.field == undefined){
          scope.form.data = {data: scope.form.data};
          scope.field = 'data';
        }
        // create private data instance
        scope.form._data = angular.copy(scope.form.data);

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

          }
        };

        scope.updateTemplate = function(){
          element.html(scope.getTemplate());
          $compile(element.contents())(scope);
        };

        scope.$watch('form.editing', scope.updateTemplate);
        scope.$watch('form.enable', scope.updateTemplate);
        scope.$watch('form._data', function(){
          if(scope.field == undefined){
            scope.data = scope.form._data;
          }
        });

      }
    }
  }]);