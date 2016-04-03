// bind takes a function and 'binds' the 'this'
//   variable in it to a particular target object,
// i.e. returns a version of the function which uses
//    the target as 'this'
Function.prototype.bind = Function.prototype.bind || function (target) {
  var self = this;	// the function being bound
  // It is vitally important that self is NOT a global variable.
  // Whenever this gets called, a specific target 'self' is hardwired into the returned function
  return function (args) {
    if (!(args instanceof Array)) {
      args = [args];
    }
    self.apply(target, args);
  };
};
