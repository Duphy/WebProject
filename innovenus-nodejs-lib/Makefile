.PHONY=all,lib

help: html/index.chm

html/index.chm: Doxyfile src/binding.gyp src/common.cpp src/create.cpp src/resolv.cpp src/common.h src/resolv.h src/create.h
	doxygen;\
	iconv -t GBK html/index.hhc > index.hhc;\
	mv index.hhc html/;\
	iconv -t GBK html/index.hhk > index.hhk;\
	mv index.hhk html/;\
	iconv -t GBK html/index.hhp > index.hhp;\
	mv index.hhp html/;\
	hhc html/index.hhp
	
all: lib
	cp -f src/build/Release/lib.node ../../ironMan/node_modules/lib.node
	
lib: src/build/Release/lib.node

src/build/Release/lib.node: src/binding.gyp src/common.cpp src/create.cpp src/resolv.cpp src/common.h src/resolv.h src/create.h
	cd src;\
	node-gyp configure;\
	node-gyp build;\