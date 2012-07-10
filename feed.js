(function(w){
	w.Feed = Feed;
	
	var Matchers = [];
	
	function Feed( template, data, opt_source_type ){
		var source_type = type_of( data );
		var is_array = source_type == 'array';
		
		var is_json = opt_source_type == 'json' || source_type == 'object';
		var is_json_array = is_json || ( is_array && type_of(data[0]) == 'object' && type_of(data[1]) == 'object');
		var is_list = is_array && type_of( data[0] ) != 'object';
		
		var array = is_array? data : [data];
		var array_len = array.length;
		
		var output = [];
		
		var matchers = Matchers;
		var matchers_len = matchers.length;
		var matcher;
		
		if( is_list ) {
			output = match_list( template, data );
		} else {
			for(var i = 0; i < array_len; i++ ) {
				var temp = template;
				
				for( var j = 0; j < matchers_len; j++ ){
					temp = matchers[j]( temp, array[i] );
				}
				
				output[ output.length ] = temp;
			}
		}
		
		return clear( output );
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
	function clear( data ) {
		var clean_a = /\[\[(.+){{}}(.+)\]\]/ig;
		var clean_b = /{{}}/ig;
		var clean_c = /\[\[(.+)\]\]/ig;
		
		var is_array = data instanceof Array;
		var output = is_array ? data : [data];	
		var i = output.length;
		
		while(i--){
			output[ i ] = output[ i ].replace( clean_a, "" ).replace( clean_b, "" ).replace( clean_c, "$1" );
		}
		
		return is_array? output : output[0];
	}
	
	// This method would make the Feed function available at string level prototype
	Feed.set_prototype = function() {
		String.prototype.feed = function( source, opt_source_type ) {
			var template = this;
			return Feed(template, source, opt_source_type );
		};
	};
	
	Feed.add_matcher = function( matcher ) {
		Matchers[ Matchers.length ] = matcher;
	};
	
	Feed.add_matcher( match_value );
	Feed.add_matcher( match_for_each );
	
	function match_value( template, data ){
		var pattern = /{{([a-z\-_]+[0-9]*)}}/ig;
		
		var replacer = function(match, name, index, string){
			return data[name] || '{{}}';
		};
		
		return template.replace( pattern, replacer );
	}
	
	function match_for_each( template, data ) {
		var pattern = /{{for_each ([a-z\-_]+[0-9]*)}}([^]*?)({{\/each}})/ig;
		
		var replacer = function(match, item, body, index, string){
			return Feed( body, data[item] );
		};
		
		return template.replace( pattern, replacer );
	}

	function match_list( template, list ){
		var pattern = /{{#}}/ig;
		var i = list.length;
		var c = 0;
		var output = [];

		while( i-- ) {
			output[ output.length ] = template.replace( pattern, list[c++] );
		}
		
		return output.join('');
	}	
	
})(window);