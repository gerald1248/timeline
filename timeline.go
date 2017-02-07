package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"sync"
)

func main() {
	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "Usage: ./%s [<JSON file> [<JSON file>]]\n", filepath.Base(os.Args[0]))
		flag.PrintDefaults()
		os.Exit(0)
	}
	certificate := flag.String("c", "cert.pem", "TLS server certificate")
	key := flag.String("k", "key.pem", "TLS server key")
	hostname := flag.String("n", "localhost", "Hostname")
	port := flag.Int("p", 8443, "listen on port")
	flag.Parse()

	args := flag.Args()

	if len(args) == 0 {
		serve(*certificate, *key, *hostname, *port)
		return
	}

	ch := make(chan ShortResult)

	for _, input := range args {
		go processFile(input, ch)
	}

	var mu sync.Mutex
	var code int
	for range args {
		result := <-ch
		mu.Lock()
		code += result.Code
		mu.Unlock()
		fmt.Println(result.Message)
	}
	os.Exit(code)
}
