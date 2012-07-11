(function(w){
	w.Feed = Feed;
	
	var Matchers = [];
	
	function Feed( template, data, opt_data_type ){
		var data_type = type_of( data );
		
		var is_array = data_type == 'array';
		var is_json = opt_data_type == 'json' || data_type == 'object';
		
		var is_json_array = is_json || ( is_array && type_of( data[0])  == 'object' && type_of( data[1] ) == 'object');
		
		if( is_json || is_json_array ) {
			data_type = 'json';
			
		}else if( opt_data_type == 'list' || (is_array && type_of( data[0] ) != 'object') ) {
			data_type = 'list';
		}
		
		var matchers = Matchers;
		var matchers_len = matchers.length;
		
		var temp = template;
		
		for( var j = 0; j < matchers_len; j++ ){
			temp = matchers[j]( temp, data, data_type );
		}
		
		return clear( temp );
	}
	
	// Simple object type detector
	function type_of( object ){
		var type = typeof( object );
		
		if( type == 'object' ){
			if( object === null ){
				type = 'null';
				
			}else if( object instanceof Array || 'splice' in object && 'join' in object ){
				type = 'array';
			}
		}
		
		return type;
	}
	
	// Removes optional brackets and un-replaced place holders
	function clear( template ) {
		var clean_a = /\[\[(.+){{}}(.+)\]\]/ig;
		var clean_b = /{{}}/ig;
		var clean_c = /\[\[(.+)\]\]/ig;
		
		return template.replace( clean_a, "" ).replace( clean_b, "" ).replace( clean_c, "$1" );
	}
	
	// Matchers
	function match_value( template, data, data_type ){
		if( data_type != 'json' ) return template;
		
		var pattern = /{{([a-z\-_]+[0-9]*)}}/ig;
		
		var array = data instanceof Array? data : [data];
		var length = array.length;
		var i = 0;
		
		var obj;
		var output = [];
		
		while( length-- ){
			obj = array[ i++ ];
			
			output[ output.length ] = template.replace( pattern,
				function(holder, name){
					return obj[ name ] || '';
				}
			);
		}
		
		return output.join('');
	}
	
	function match_for_each( template, data, data_type ){
		var pattern = /{{for_each ([a-z\-_]+[0-9]*)}}([^]*?)({{\/each}})/ig;

		if( pattern.test( template ) == false ) return  template;
		
		var replacer = function(match, item, body, index, string){
			return Feed( body, data[item] );
		};
		
		return template.replace( pattern, replacer );
	}

	function match_list( template, data, data_type ){
		if( data_type != 'list' ) return  template;
		
		var pattern = /{{#}}/ig;
		var i = data.length;
		var c = 0;
		var output = [];

		while( i-- ) {
			output[ output.length ] = template.replace( pattern, data[c++] );
		}
		
		return output.join('');
	}	

	// This method would make the Feed function available at string level prototype
	Feed.set_prototype = function() {
		String.prototype.feed = function( data, opt_data_type ) {
			var template = this;
			return Feed(template, data, opt_data_type );
		};
	};
	
	Feed.add_matcher = function( matcher ) {
		Matchers[ Matchers.length ] = matcher;
	};
	
	Feed.add_matcher( match_value );
	Feed.add_matcher( match_for_each );
	Feed.add_matcher( match_list );
	
})(window);