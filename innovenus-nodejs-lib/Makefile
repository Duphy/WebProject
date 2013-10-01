.PHONY=all,lib

all: lib
	cp -f src/build/Release/.node ../../ironMan/node_modules/lib.node
	
lib: src/build/Release/.node

src/build/Release/.node: src/binding.gyp src/common.cpp src/create.cpp src/resolv.cpp src/common.h src/resolv.h src/create.h
	cd src;\
	node-gyp configure;\
	node-gyp build;\