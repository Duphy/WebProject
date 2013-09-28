.PHONY=all,lib

all: lib
	cp -f src/build/Release/.node ../../ironMan/node_modules/lib.node
	
lib: src/build/Release/.node

src/build/Release/.node: src/binding.gyp src/common.cpp src/create.cpp src/resolv.cpp
	cd src;\
	node-gyp configure;\
	node-gyp build;\