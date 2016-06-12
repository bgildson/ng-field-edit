angular.module('ng-field-edit', [])
  .run(['$templateCache', function($templateCache){
    // template to input[text]
    $templateCache.put('template/ng-field-edit_field_text.html', '<input type="text" ng-model="_data" value="test">');
    $templateCache.put('template/ng-field-edit_data_text.html', '{{ _data }}');
  }])
  .factory('feForm', function(){
    return {
      $visible: true, 
      $editing: false, 
      $enable: true, 
      $waiting: false,
      $save: function(){
        this.editing = false;
      },
      $edit: function(){
        this.editing = false;
      },
      $cancel: function(){
        this.editing = false;
      }
    };
  })
  .directive('ngFormFieldEdit', function(){
    return {
      restrict: 'A',
      replace: true,
      template: '',
      scope: {
        form: '=feForm'
      },
      link: function(scope, element, attrs){

      }
    }
  })
  .directive('ngFieldEdit', ['$compile', '$templateCache', function($compile, $templateCache){
    return {
      restrict: 'A', 
      replace: true, 
      scope: {
        form:     '=feForm', 
        field:    '=feField',
        data:     '=?feData', 
        save:     '=?feSave', 
        edit:     '=?feEdit', 
        cancel:   '=?feCancel', 
        visible:  '=?feVisible', 
        editable: '=?feEditable', 
        editing:  '=?feEditing', 
        enable:   '=?feEnable', 
        waiting:  '=?feWaiting', 
        extra:    '=?feExtra'
      },
      link: function(scope, element, attrs){

        scope._data = (scope.data ? scope.data : '');
        scope.editing = (scope.editing !== undefined ? false : scope.editing);

        /****************
         * internal
         ****************/
        scope._save = function(){
          scope.editing = false;
          scope.data = scope._data;
          if(scope.save){
            scope.save();
          }
        };

        scope._edit = function(){
          scope.editing = true;
          if(scope.edit){
            scope.edit();
          }
        };

        scope.getTemplate = function(){

          if(scope.editing){
            switch(attrs.ngFieldEdit){
              case 'text':
                return $templateCache.get('template/ng-field-edit_field_text.html');

            }

          }else{
            switch(attrs.ngFieldEdit){
              case 'text':
                return $templateCache.get('template/ng-field-edit_data_text.html');

            }

          }
        };

        scope.updateTemplate = function(){
          element.html(scope.getTemplate());
          $compile(element.contents())(scope);
        };

        scope.$watch('editing', scope.updateTemplate);
        scope.$watch('enable', scope.updateTemplate);

      }
    }
  }]);