pipeline {
    agent {
        docker {
            image 'node:latest'
        }
    }
    environment {
        SONAR_URL = "http://54.85.130.134:9000"
        DOCKER_IMAGE_FRONTEND = "maheshkumars772/frontend:latest"
        DOCKER_IMAGE_BACKEND = "maheshkumars772/backend:latest"
        REGISTRY_CREDENTIALS = credentials('docker-cred')
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/smahesh-kumarr/Blog-App.git'
            }
        }
        stage('Build & Test in Parallel') {
            parallel {
                stage('Frontend Build & Test') {
                    steps {
                        sh 'cd client && npm install && npm run build'
                        sh 'cd client && npm test'
                    }
                }
                stage('Backend Build & Test') {
                    steps {
                        sh 'cd api && npm install'
                        sh 'cd api && npm test'
                    }
                }
            }
        }
        stage('Static Code Analysis - Parallel') {
            parallel {
                stage('SonarQube Frontend') {
                    steps {
                        withCredentials([string(credentialsId: 'sonarqube', variable: 'SONAR_AUTH_TOKEN')]) {
                            sh '''
                                cd client
                                npx sonar-scanner \
                                -Dsonar.projectKey=frontend-project \
                                -Dsonar.sources=src \
                                -Dsonar.host.url=${SONAR_URL} \
                                -Dsonar.login=$SONAR_AUTH_TOKEN
                            '''
                        }
                    }
                }
                stage('SonarQube Backend') {
                    steps {
                        withCredentials([string(credentialsId: 'sonarqube', variable: 'SONAR_AUTH_TOKEN')]) {
                            sh '''
                                cd api
                                npx sonar-scanner \
                                -Dsonar.projectKey=backend-project \
                                -Dsonar.sources=. \
                                -Dsonar.host.url=${SONAR_URL} \
                                -Dsonar.login=$SONAR_AUTH_TOKEN
                            '''
                        }
                    }
                }
            }
        }
        stage('Build & Push Docker Images - Parallel') {
            parallel {
                stage('Build & Push Frontend') {
                    steps {
                        script {
                            sh 'cd client && docker build -t ${DOCKER_IMAGE_FRONTEND} .'
                            def dockerImageFrontend = docker.image("${DOCKER_IMAGE_FRONTEND}")
                            docker.withRegistry('https://index.docker.io/v1/', "docker-cred") {
                                dockerImageFrontend.push()
                            }
                        }
                    }
                }
                stage('Build & Push Backend') {
                    steps {
                        script {
                            sh 'cd api && docker build -t ${DOCKER_IMAGE_BACKEND} .'
                            def dockerImageBackend = docker.image("${DOCKER_IMAGE_BACKEND}")
                            docker.withRegistry('https://index.docker.io/v1/', "docker-cred") {
                                dockerImageBackend.push()
                            }
                        }
                    }
                }
            }
        }
        stage('Update Kubernetes Deployment') {
            parallel {
                stage('Update Frontend Deployment') {
                    steps {
                        withCredentials([string(credentialsId: 'github', variable: 'GITHUB_TOKEN')]) {
                            sh '''
                                git config user.email "maheshkumar08042006@gmail.com"
                                git config user.name "smahesh-kumarr"
                                sed -i "s/replaceImageTag/latest/g" ../argo-manifests/frontend/deployment.yml
                                git add ../argo-manifests/frontend/deployment.yml
                                git commit -m "Update frontend image to latest"
                                git push https://${GITHUB_TOKEN}@github.com/smahesh-kumarr/argo-manifests.git HEAD:main
                            '''
                        }
                    }
                }
                stage('Update Backend Deployment') {
                    steps {
                        withCredentials([string(credentialsId: 'github', variable: 'GITHUB_TOKEN')]) {
                            sh '''
                                git config user.email "maheshkumar08042006@gmail.com"
                                git config user.name "smahesh-kumarr"
                                sed -i "s/replaceImageTag/latest/g" ../argo-manifests/backend/deployment.yml
                                git add ../argo-manifests/backend/deployment.yml
                                git commit -m "Update backend image to latest"
                                git push https://${GITHUB_TOKEN}@github.com/smahesh-kumarr/argo-manifests.git HEAD:main
                            '''
                        }
                    }
                }
            }
        }
    }
}
