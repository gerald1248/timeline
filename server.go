package main

import (
	"bytes"
	"crypto/tls"
	b64 "encoding/base64"
	"fmt"
	"github.com/elazarl/go-bindata-assetfs"
	"github.com/kabukky/httpscerts"
	"io/ioutil"
	"log"
	"net/http"
	"time"
)

type PostStruct struct {
	Buffer string
}

func serve(certificate, key, hostname string, port int) {
	virtual_fs := &assetfs.AssetFS{
		Asset:     Asset,
		AssetDir:  AssetDir,
		AssetInfo: AssetInfo}

	//set up custom mux
	mux := http.NewServeMux()
	mux.Handle("/static/", http.FileServer(virtual_fs))
	mux.HandleFunc("/timeline/compose", guiHandler)
	mux.HandleFunc("/timeline", handler)

	err := httpscerts.Check(certificate, key)
	if err != nil {
		cert, key, err := httpscerts.GenerateArrays(fmt.Sprintf("%s:%d", hostname, port))
		if err != nil {
			log.Fatal("Can't create https certs")
		}

		keyPair, err := tls.X509KeyPair(cert, key)
		if err != nil {
			log.Fatal("Can't create key pair")
		}

		var certificates []tls.Certificate
		certificates = append(certificates, keyPair)

		cfg := &tls.Config{
			MinVersion:               tls.VersionTLS12,
			PreferServerCipherSuites: true,
			Certificates:             certificates,
		}

		s := &http.Server{
			Addr:           fmt.Sprintf("%s:%d", hostname, port),
			Handler:        mux,
			ReadTimeout:    10 * time.Second,
			WriteTimeout:   10 * time.Second,
			MaxHeaderBytes: 1 << 20,
			TLSConfig:      cfg,
		}
		fmt.Print(listening(hostname, port, true))
		log.Fatal(s.ListenAndServeTLS("", ""))
	}
	fmt.Print(listening(hostname, port, false))
	log.Fatal(http.ListenAndServeTLS(fmt.Sprintf("%s:%d", hostname, port), certificate, key, mux))
}

func listening(hostname string, port int, selfCert bool) string {
	var selfCertMsg string
	if selfCert {
		selfCertMsg = " (self-certified)"
	}
	return fmt.Sprintf("Listening on port %d%s\n"+
		"POST JSON sources to https://%s:%d/timeline\n"+
		"Generate report at https://%s:%d/timeline/compose\n", port, selfCertMsg, hostname, port, hostname, port)
}

/*
func serve(certificate, key, hostname string, port int) {
	virtual_fs := &assetfs.AssetFS{
		Asset:     Asset,
		AssetDir:  AssetDir,
		AssetInfo: AssetInfo}

	err := httpscerts.Check(certificate, key)
	if err != nil {
		err = httpscerts.Generate(certificate, key, fmt.Sprintf("%s:%d", hostname, port))
		if err != nil {
			log.Fatal("Can't create https certs")
		}
		fmt.Printf("Created %s and %s\n", certificate, key)
	}

	http.Handle("/static/", http.FileServer(virtual_fs))
	http.HandleFunc("/timeline/compose", guiHandler)
	http.HandleFunc("/timeline", handler)

	fmt.Printf("Listening on port %d\n"+
		"POST JSON sources to https://%s:%d/timeline\n"+
		"Compose timelines at https://%s:%d/timeline/compose\n", port, hostname, port, hostname, port)
	log.Fatal(http.ListenAndServeTLS(fmt.Sprintf("%s:%d", hostname, port), certificate, key, nil))
}
*/

func guiHandler(w http.ResponseWriter, r *http.Request) {
	bytes, _ := Asset("static/index.html")
	fmt.Fprintf(w, "%s\n", string(bytes))
}

func handler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		handlePost(&w, r)
	case "GET":
		handleGet(&w, r)
	}
}

func handleGet(w *http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(*w, "GET request\nRequest struct = %v\n", r)
}

func handlePost(w *http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		fmt.Fprintf(*w, "Can't read POST request body: %s\n", err)
		return
	}

	result := processBytes(body)

	if result.Code > 0 {
		fmt.Fprintf(*w, "<p>%s</p>", result.Message)
		return
	}

	//now display using base64 data
	buf := new(bytes.Buffer)
	err = result.Context.EncodePNG(buf)
	if err != nil {
		fmt.Fprintf(*w, "<p>Can't encode resulting image: %v</p>", err)
		return
	}

	//TBD: option to return bytestream
	s := b64.StdEncoding.EncodeToString(buf.Bytes())
	fmt.Fprintf(*w, "<img class=\"img-responsive\" alt=\"Timeline\" src=\"data:image/png;base64,%s\"/>", s)
}
