pipeline {
    agent any

    environment {
        SONAR_URL = "http://54.85.130.134:9000"
        DOCKER_REGISTRY = "https://index.docker.io/"
        DOCKER_IMAGE_FRONTEND = "maheshkumars772/frontend:latest"
        DOCKER_IMAGE_BACKEND = "maheshkumars772/backend:latest"
        REGISTRY_CREDENTIALS = credentials('docker-cred')
        NODE_OPTIONS = "--openssl-legacy-provider"
    }

    stages {
        stage('System Cleanup') {
            steps {
                sh '''#!/bin/bash -e
                    docker system prune -af || true
                    npm cache clean --force
                    find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
                    df -h
                    du -sh *
                '''
            }
        }
        stage('Clean Workspace & Checkout') {
            steps {
                cleanWs()
                sh 'mkdir -p ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts'
                git branch: 'main', url: 'https://github.com/smahesh-kumarr/Blog-App.git'
            }
        }

        stage('Frontend Pipeline') {
            stages {
                stage('Frontend Dependencies') {
                    steps {
                        sh '''#!/bin/bash -e
                            cd client
                            npm install react@18.2.0 react-dom@18.2.0 --legacy-peer-deps --save
                            npm install --legacy-peer-deps --force --loglevel=error
                        '''
                    }
                }

                stage('Frontend Build') {
                    steps {
                        sh '''#!/bin/bash -e
                            cd client
                            DISABLE_ESLINT_PLUGIN=true npm run build
                        '''
                    }
                }

                stage('Frontend SonarQube') {
                    steps {
                        withCredentials([string(credentialsId: 'sonarqube', variable: 'SONAR_AUTH_TOKEN')]) {
                            sh '''
                                cd client
                                npx sonar-scanner \
                                    -Dsonar.projectKey=frontend-project \
                                    -Dsonar.sources=src \
                                    -Dsonar.host.url=${SONAR_URL} \
                                    -Dsonar.login=${SONAR_AUTH_TOKEN} \
                                    -Dsonar.scm.disabled=true
                            '''
                        }
                    }
                }

                stage('Frontend Docker') {
                    steps {
                        script {
                            withCredentials([usernamePassword(
                                credentialsId: 'docker-cred',
                                usernameVariable: 'DOCKER_USER',
                                passwordVariable: 'DOCKER_PASS'
                            )]) {
                                sh '''
                                # Install and configure buildx
                                docker buildx install
                                docker buildx create --use
                                
                                # Build with buildx
                                docker buildx build \
                                    --platform linux/amd64 \
                                    --tag ${DOCKER_IMAGE_FRONTEND} \
                                    --push \
                                    --no-cache \
                                    ./client
                                
                                # Cleanup
                                docker buildx rm mybuilder
                            '''
                            }
                        }
                    }
                }
            }
        }

        stage('Backend Pipeline') {
            stages {
                stage('Backend Dependencies') {
                    steps {
                        sh '''#!/bin/bash -e
                            cd api
                            npm install --force --loglevel=error
                        '''
                    }
                }

                stage('Backend Build') {
                    steps {
                        sh '''#!/bin/bash -e
                            cd api
                            npm run build
                        '''
                    }
                }

                stage('Backend SonarQube') {
                    steps {
                        withCredentials([string(credentialsId: 'sonarqube', variable: 'SONAR_AUTH_TOKEN')]) {
                            sh '''
                                cd api
                                npx sonar-scanner \
                                    -Dsonar.projectKey=backend-project \
                                    -Dsonar.sources=. \
                                    -Dsonar.host.url=${SONAR_URL} \
                                    -Dsonar.login=${SONAR_AUTH_TOKEN} \
                                    -Dsonar.scm.disabled=true
                            '''
                        }
                    }
                }

                stage('Backend Docker') {
                    steps {
                        script {
                            withCredentials([usernamePassword(
                                credentialsId: 'docker-cred',
                                usernameVariable: 'DOCKER_USER',
                                passwordVariable: 'DOCKER_PASS'
                            )]) {
                            sh '''
                                # Install and configure buildx
                                docker buildx install
                                docker buildx create --use --name mybuilder
                                
                                # Build with buildx
                                docker buildx build \
                                    --platform linux/amd64 \
                                    --tag ${DOCKER_IMAGE_BACKEND} \
                                    --push \
                                    --no-cache \
                                    --build-arg NODE_ENV=production \
                                    ./api
                                
                                # Cleanup
                                docker buildx rm mybuilder
                            '''
                            }
                        }
                    }
                }
            }
        }
    }
    post {
    failure {
        sh '''
            docker buildx rm || true
            docker container prune -f
            docker image prune -af
        '''
    }
}
    post {
        always {
            cleanWs()
        }
    }
}